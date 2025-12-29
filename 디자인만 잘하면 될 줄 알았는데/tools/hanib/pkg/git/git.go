package git

import (
	"bytes"
	"fmt"
	"os/exec"
	"strings"
)

// Status represents the git status of a file
type FileStatus struct {
	Path   string `json:"path"`
	Status string `json:"status"` // "M" modified, "A" added, "D" deleted, "?" untracked
	Staged bool   `json:"staged"`
}

// RepoStatus represents the overall repository status
type RepoStatus struct {
	Branch  string       `json:"branch"`
	Clean   bool         `json:"clean"`
	Ahead   int          `json:"ahead"`
	Behind  int          `json:"behind"`
	Files   []FileStatus `json:"files"`
	HasRepo bool         `json:"hasRepo"`
}

// GetStatus returns the current git status
func GetStatus(dir string) (*RepoStatus, error) {
	status := &RepoStatus{HasRepo: true}

	// Check if it's a git repo
	if _, err := runGit(dir, "rev-parse", "--git-dir"); err != nil {
		return &RepoStatus{HasRepo: false}, nil
	}

	// Get current branch
	branch, err := runGit(dir, "branch", "--show-current")
	if err != nil {
		return nil, err
	}
	status.Branch = strings.TrimSpace(branch)

	// Get status
	output, err := runGit(dir, "status", "--porcelain")
	if err != nil {
		return nil, err
	}

	status.Clean = len(strings.TrimSpace(output)) == 0

	// Parse file statuses
	for _, line := range strings.Split(output, "\n") {
		if len(line) < 3 {
			continue
		}

		staged := line[0]
		unstaged := line[1]
		path := strings.TrimSpace(line[3:])

		fs := FileStatus{Path: path}

		if staged != ' ' && staged != '?' {
			fs.Status = string(staged)
			fs.Staged = true
		} else if unstaged != ' ' {
			fs.Status = string(unstaged)
			fs.Staged = false
		} else if staged == '?' {
			fs.Status = "?"
			fs.Staged = false
		}

		status.Files = append(status.Files, fs)
	}

	// Get ahead/behind
	aheadBehind, _ := runGit(dir, "rev-list", "--left-right", "--count", "HEAD...@{u}")
	parts := strings.Fields(aheadBehind)
	if len(parts) == 2 {
		fmt.Sscanf(parts[0], "%d", &status.Ahead)
		fmt.Sscanf(parts[1], "%d", &status.Behind)
	}

	return status, nil
}

// Add stages files for commit
func Add(dir string, paths ...string) error {
	args := append([]string{"add"}, paths...)
	_, err := runGit(dir, args...)
	return err
}

// Commit creates a commit with the given message
func Commit(dir, message string) error {
	_, err := runGit(dir, "commit", "-m", message)
	return err
}

// Push pushes to the remote
func Push(dir string) error {
	_, err := runGit(dir, "push")
	return err
}

// Pull pulls from the remote
func Pull(dir string) error {
	_, err := runGit(dir, "pull")
	return err
}

// runGit runs a git command and returns the output
func runGit(dir string, args ...string) (string, error) {
	cmd := exec.Command("git", args...)
	cmd.Dir = dir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("git %s: %s", strings.Join(args, " "), stderr.String())
	}

	return stdout.String(), nil
}
