package main

import (
	"bufio"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/99pcnt/hanib/pkg/content"
	"github.com/99pcnt/hanib/pkg/git"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

var (
	port        = flag.Int("port", 3031, "Server port")
	contentRoot = flag.String("root", "", "Content root directory")
)

func main() {
	flag.Parse()

	// Find content root
	root := *contentRoot
	if root == "" {
		root = findProjectRoot()
	}
	if root == "" {
		log.Fatal("Error: CLAUDE.md가 있는 프로젝트 루트를 찾을 수 없습니다.")
	}

	log.Printf("Content root: %s", root)

	app := fiber.New(fiber.Config{
		BodyLimit: 10 * 1024 * 1024, // 10MB
	})

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	// API routes
	api := app.Group("/api")

	// Tree endpoint
	api.Get("/tree", func(c *fiber.Ctx) error {
		tree, err := content.LoadTree(root)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(tree)
	})

	// File read endpoint
	api.Get("/file", func(c *fiber.Ctx) error {
		path := c.Query("path")
		if path == "" {
			return c.Status(400).JSON(fiber.Map{"error": "path required"})
		}

		fullPath := filepath.Join(root, path)
		if !strings.HasPrefix(fullPath, root) {
			return c.Status(403).JSON(fiber.Map{"error": "access denied"})
		}

		data, err := os.ReadFile(fullPath)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{
			"path":    path,
			"content": string(data),
		})
	})

	// File write endpoint
	api.Put("/file", func(c *fiber.Ctx) error {
		var req struct {
			Path    string `json:"path"`
			Content string `json:"content"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		fullPath := filepath.Join(root, req.Path)
		if !strings.HasPrefix(fullPath, root) {
			return c.Status(403).JSON(fiber.Map{"error": "access denied"})
		}

		if err := os.WriteFile(fullPath, []byte(req.Content), 0644); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{"success": true})
	})

	// Claude chat endpoint (SSE) - multi-turn with file system access
	api.Post("/claude", func(c *fiber.Ctx) error {
		var req struct {
			Prompt     string   `json:"prompt"`
			FilePaths  []string `json:"filePaths"`  // File paths as context
			SessionID  string   `json:"sessionId"`  // For conversation continuity
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		// Build prompt with file path context
		fullPrompt := req.Prompt
		if len(req.FilePaths) > 0 {
			pathList := strings.Join(req.FilePaths, ", ")
			fullPrompt = fmt.Sprintf("컨텍스트 파일들: %s\n\n%s", pathList, req.Prompt)
		}

		// Set SSE headers
		c.Set("Content-Type", "text/event-stream")
		c.Set("Cache-Control", "no-cache")
		c.Set("Connection", "keep-alive")
		c.Set("Transfer-Encoding", "chunked")

		c.Context().SetBodyStreamWriter(func(w *bufio.Writer) {
			// Build claude command with working directory
			args := []string{"-p", fullPrompt, "--allowedTools", "Edit,Write,Read"}

			// Continue session if sessionId provided
			if req.SessionID != "" {
				args = append(args, "--resume", req.SessionID)
			}

			cmd := exec.Command("claude", args...)
			cmd.Dir = root // Set working directory to content root

			stdout, err := cmd.StdoutPipe()
			if err != nil {
				sendSSE(w, "error", err.Error())
				return
			}

			stderr, err := cmd.StderrPipe()
			if err != nil {
				sendSSE(w, "error", err.Error())
				return
			}

			if err := cmd.Start(); err != nil {
				sendSSE(w, "error", err.Error())
				return
			}

			// Read stdout
			go func() {
				scanner := bufio.NewScanner(stderr)
				for scanner.Scan() {
					line := scanner.Text()
					sendSSE(w, "stderr", line)
				}
			}()

			scanner := bufio.NewScanner(stdout)
			for scanner.Scan() {
				line := scanner.Text()
				sendSSE(w, "content", line)
			}

			if err := cmd.Wait(); err != nil {
				sendSSE(w, "error", err.Error())
			}

			sendSSE(w, "done", "")
		})

		return nil
	})

	// File modification time endpoint (for change detection)
	api.Get("/file/mtime", func(c *fiber.Ctx) error {
		path := c.Query("path")
		if path == "" {
			return c.Status(400).JSON(fiber.Map{"error": "path required"})
		}

		fullPath := filepath.Join(root, path)
		if !strings.HasPrefix(fullPath, root) {
			return c.Status(403).JSON(fiber.Map{"error": "access denied"})
		}

		info, err := os.Stat(fullPath)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{
			"path":  path,
			"mtime": info.ModTime().UnixMilli(),
		})
	})

	// Git status endpoint
	api.Get("/git/status", func(c *fiber.Ctx) error {
		status, err := git.GetStatus(root)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(status)
	})

	// Git add endpoint
	api.Post("/git/add", func(c *fiber.Ctx) error {
		var req struct {
			Paths []string `json:"paths"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		if len(req.Paths) == 0 {
			req.Paths = []string{"."}
		}

		if err := git.Add(root, req.Paths...); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{"success": true})
	})

	// Git commit endpoint
	api.Post("/git/commit", func(c *fiber.Ctx) error {
		var req struct {
			Message string `json:"message"`
		}
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": err.Error()})
		}

		if req.Message == "" {
			return c.Status(400).JSON(fiber.Map{"error": "message required"})
		}

		if err := git.Commit(root, req.Message); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}

		return c.JSON(fiber.Map{"success": true})
	})

	// Git push endpoint
	api.Post("/git/push", func(c *fiber.Ctx) error {
		if err := git.Push(root); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": err.Error()})
		}
		return c.JSON(fiber.Map{"success": true})
	})

	// Static files (for production)
	app.Static("/", "./web/dist")

	// SPA fallback
	app.Get("*", func(c *fiber.Ctx) error {
		return c.SendFile("./web/dist/index.html")
	})

	log.Printf("Server starting on http://localhost:%d", *port)
	log.Fatal(app.Listen(fmt.Sprintf(":%d", *port)))
}

func findProjectRoot() string {
	dir, _ := os.Getwd()
	for {
		if _, err := os.Stat(filepath.Join(dir, "CLAUDE.md")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return ""
}

func sendSSE(w *bufio.Writer, eventType, data string) {
	msg := map[string]string{
		"type": eventType,
		"text": data,
	}
	jsonData, _ := json.Marshal(msg)
	fmt.Fprintf(w, "data: %s\n\n", jsonData)
	w.Flush()
}
