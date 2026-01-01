package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/99pcnt/hanib/pkg/content"
)

const usage = `hanib - 콘텐츠 관리 도구

Usage:
  hanib add part <title>                      파트 추가
  hanib add week <part-num> <title>           주차 추가
  hanib add ep <part-num> <week-num> <title>  에피소드 추가
  hanib add var <episode-path> [version]      변형 추가
  hanib list                                  현재 구조 보기
  hanib serve                                 웹 에디터 서버 시작

Examples:
  hanib add part "제품을 만든 후"
  hanib add week 1 "회의에서 한번쯤 들어본 용어들"
  hanib add ep 1 1 "린 스타트업"
  hanib add var part01_제품을_만들기_전/week01_.../ep01_린_스타트업 v2
  hanib serve --port 3000
`

func main() {
	if len(os.Args) < 2 {
		fmt.Println(usage)
		os.Exit(0)
	}

	// 프로젝트 루트 찾기
	root := findProjectRoot()
	if root == "" {
		fmt.Println("Error: CLAUDE.md가 있는 프로젝트 루트를 찾을 수 없습니다.")
		os.Exit(1)
	}

	switch os.Args[1] {
	case "add":
		if len(os.Args) < 3 {
			fmt.Println(usage)
			os.Exit(1)
		}
		handleAdd(root, os.Args[2:])
	case "list":
		handleList(root)
	case "serve":
		fmt.Println("웹 서버는 별도의 바이너리(hanib-server)를 사용하세요.")
		fmt.Println("  cd tools/hanib && make serve")
	default:
		fmt.Println(usage)
	}
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

func handleAdd(root string, args []string) {
	if len(args) < 2 {
		fmt.Println("Error: 타입과 제목이 필요합니다.")
		os.Exit(1)
	}

	switch args[0] {
	case "part":
		addPart(root, args[1])
	case "week":
		if len(args) < 3 {
			fmt.Println("Error: part 번호와 제목이 필요합니다.")
			os.Exit(1)
		}
		partNum, _ := strconv.Atoi(args[1])
		addWeek(root, partNum, args[2])
	case "ep", "episode":
		if len(args) < 4 {
			fmt.Println("Error: part 번호, week 번호, 제목이 필요합니다.")
			os.Exit(1)
		}
		partNum, _ := strconv.Atoi(args[1])
		weekNum, _ := strconv.Atoi(args[2])
		addEpisode(root, partNum, weekNum, args[3])
	case "var", "variant":
		version := "v1"
		if len(args) >= 3 {
			version = args[2]
		}
		addVariant(root, args[1], version)
	default:
		fmt.Printf("Unknown type: %s\n", args[0])
	}
}

func addPart(root, title string) {
	num := content.FindNextNumber(root, "part")
	folderName := fmt.Sprintf("part%02d_%s", num, content.SanitizeName(title))
	partDir := filepath.Join(root, folderName)

	if err := os.MkdirAll(partDir, 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	meta := map[string]interface{}{
		"title":       title,
		"order":       num,
		"description": "",
	}
	content.SaveMetaMap(filepath.Join(partDir, "meta.yaml"), meta)

	fmt.Printf("✓ Part 생성됨: %s\n", folderName)
}

func addWeek(root string, partNum int, title string) {
	partDir := content.FindDirByPrefix(root, fmt.Sprintf("part%02d", partNum))
	if partDir == "" {
		fmt.Printf("Error: part%02d를 찾을 수 없습니다.\n", partNum)
		os.Exit(1)
	}

	num := content.FindNextNumber(partDir, "week")
	folderName := fmt.Sprintf("week%02d_%s", num, content.SanitizeName(title))
	weekDir := filepath.Join(partDir, folderName)

	if err := os.MkdirAll(weekDir, 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	meta := map[string]interface{}{
		"title":    title,
		"order":    num,
		"part":     partNum,
		"keywords": []string{},
	}
	content.SaveMetaMap(filepath.Join(weekDir, "meta.yaml"), meta)

	introContent := fmt.Sprintf("# %s\n\n{인트로 내용}\n", title)
	os.WriteFile(filepath.Join(weekDir, "intro.md"), []byte(introContent), 0644)

	fmt.Printf("✓ Week 생성됨: %s/%s\n", filepath.Base(partDir), folderName)
}

func addEpisode(root string, partNum, weekNum int, title string) {
	partDir := content.FindDirByPrefix(root, fmt.Sprintf("part%02d", partNum))
	if partDir == "" {
		fmt.Printf("Error: part%02d를 찾을 수 없습니다.\n", partNum)
		os.Exit(1)
	}

	weekDir := content.FindDirByPrefix(partDir, fmt.Sprintf("week%02d", weekNum))
	if weekDir == "" {
		fmt.Printf("Error: week%02d를 찾을 수 없습니다.\n", weekNum)
		os.Exit(1)
	}

	num := content.FindNextNumber(weekDir, "ep")
	folderName := fmt.Sprintf("ep%02d_%s", num, content.SanitizeName(title))
	epDir := filepath.Join(weekDir, folderName)

	if err := os.MkdirAll(filepath.Join(epDir, "variants"), 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	meta := map[string]interface{}{
		"title":            title,
		"order":            num,
		"week":             weekNum,
		"part":             partNum,
		"status":           "draft",
		"selected_variant": nil,
	}
	content.SaveMetaMap(filepath.Join(epDir, "meta.yaml"), meta)

	convContent := ":::conversation\n**한입**: \n\n**N**: \n:::\n"
	os.WriteFile(filepath.Join(epDir, "conversation.md"), []byte(convContent), 0644)

	yamaContent := ":::yama\n{핵심 메시지}\n:::\n"
	os.WriteFile(filepath.Join(epDir, "yama.md"), []byte(yamaContent), 0644)

	bodyContent := fmt.Sprintf("# %s\n\n## 개념 설명\n\n{설명}\n\n## 실전 팁\n\n{팁}\n", title)
	os.WriteFile(filepath.Join(epDir, "body.md"), []byte(bodyContent), 0644)

	fmt.Printf("✓ Episode 생성됨: %s\n", folderName)
	fmt.Printf("  - meta.yaml\n  - conversation.md\n  - yama.md\n  - body.md\n  - variants/\n")
}

func addVariant(root, epPath, version string) {
	var epDir string
	if filepath.IsAbs(epPath) {
		epDir = epPath
	} else {
		epDir = filepath.Join(root, epPath)
	}

	varDir := filepath.Join(epDir, "variants")
	if _, err := os.Stat(varDir); os.IsNotExist(err) {
		fmt.Printf("Error: variants 폴더를 찾을 수 없습니다: %s\n", varDir)
		os.Exit(1)
	}

	files := []string{"conversation", "yama", "body"}
	for _, f := range files {
		srcFile := filepath.Join(epDir, f+".md")
		dstFile := filepath.Join(varDir, fmt.Sprintf("%s_%s.md", version, f))

		if c, err := os.ReadFile(srcFile); err == nil {
			os.WriteFile(dstFile, c, 0644)
		} else {
			os.WriteFile(dstFile, []byte(fmt.Sprintf("# %s variant\n", f)), 0644)
		}
	}

	fmt.Printf("✓ Variant 생성됨: %s\n", version)
	fmt.Printf("  - %s_conversation.md\n  - %s_yama.md\n  - %s_body.md\n", version, version, version)
}

func handleList(root string) {
	fmt.Println("\n📚 프로젝트 구조:\n")

	tree, err := content.LoadTree(root)
	if err != nil {
		fmt.Printf("Error loading tree: %v\n", err)
		os.Exit(1)
	}

	for _, part := range tree.Parts {
		fmt.Printf("📖 %s (%s)\n", part.Title, part.Path)
		for i, week := range part.Weeks {
			weekPrefix := "├── "
			if i == len(part.Weeks)-1 {
				weekPrefix = "└── "
			}
			fmt.Printf("    %s📅 %s\n", weekPrefix, week.Title)

			for j, ep := range week.Episodes {
				epPrefix := "│   ├── "
				if i == len(part.Weeks)-1 {
					epPrefix = "    ├── "
				}
				if j == len(week.Episodes)-1 {
					if i == len(part.Weeks)-1 {
						epPrefix = "    └── "
					} else {
						epPrefix = "│   └── "
					}
				}
				variantInfo := ""
				if len(ep.Variants) > 0 {
					variantInfo = fmt.Sprintf(" [%s]", strings.Join(ep.Variants, ", "))
				}
				fmt.Printf("        %s📝 %s%s\n", epPrefix, ep.Title, variantInfo)
			}
		}
		fmt.Println()
	}
}
