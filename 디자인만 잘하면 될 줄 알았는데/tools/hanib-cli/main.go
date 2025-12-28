package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"gopkg.in/yaml.v3"
)

const usage = `hanib-cli - 콘텐츠 템플릿 생성 도구

Usage:
  hanib add part <title>                      파트 추가
  hanib add week <part-num> <title>           주차 추가
  hanib add ep <part-num> <week-num> <title>  에피소드 추가
  hanib add var <episode-path> [version]      변형 추가
  hanib list                                  현재 구조 보기

Examples:
  hanib add part "제품을 만든 후"
  hanib add week 1 "회의에서 한번쯤 들어본 용어들"
  hanib add ep 1 1 "린 스타트업"
  hanib add var part01_제품을_만들기_전/week01_.../ep01_린_스타트업 v2
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
	default:
		fmt.Println(usage)
	}
}

func findProjectRoot() string {
	// 현재 디렉토리부터 상위로 CLAUDE.md 찾기
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

func sanitizeName(name string) string {
	// 공백을 언더스코어로, 특수문자 제거
	re := regexp.MustCompile(`[^\w가-힣\s]`)
	name = re.ReplaceAllString(name, "")
	return strings.ReplaceAll(strings.TrimSpace(name), " ", "_")
}

func findNextNumber(dir, prefix string) int {
	entries, _ := os.ReadDir(dir)
	maxNum := 0
	re := regexp.MustCompile(prefix + `(\d+)`)
	for _, e := range entries {
		if e.IsDir() {
			matches := re.FindStringSubmatch(e.Name())
			if len(matches) > 1 {
				num, _ := strconv.Atoi(matches[1])
				if num > maxNum {
					maxNum = num
				}
			}
		}
	}
	return maxNum + 1
}

func addPart(root, title string) {
	num := findNextNumber(root, "part")
	folderName := fmt.Sprintf("part%02d_%s", num, sanitizeName(title))
	partDir := filepath.Join(root, folderName)

	if err := os.MkdirAll(partDir, 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	// meta.yaml 생성
	meta := map[string]interface{}{
		"title":       title,
		"order":       num,
		"description": "",
	}
	writeYAML(filepath.Join(partDir, "meta.yaml"), meta)

	fmt.Printf("✓ Part 생성됨: %s\n", folderName)
}

func addWeek(root string, partNum int, title string) {
	// 파트 폴더 찾기
	partDir := findDirByPrefix(root, fmt.Sprintf("part%02d", partNum))
	if partDir == "" {
		fmt.Printf("Error: part%02d를 찾을 수 없습니다.\n", partNum)
		os.Exit(1)
	}

	num := findNextNumber(partDir, "week")
	folderName := fmt.Sprintf("week%02d_%s", num, sanitizeName(title))
	weekDir := filepath.Join(partDir, folderName)

	if err := os.MkdirAll(weekDir, 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	// meta.yaml
	meta := map[string]interface{}{
		"title":    title,
		"order":    num,
		"part":     partNum,
		"keywords": []string{},
	}
	writeYAML(filepath.Join(weekDir, "meta.yaml"), meta)

	// intro.md
	introContent := fmt.Sprintf("# %s\n\n{인트로 내용}\n", title)
	os.WriteFile(filepath.Join(weekDir, "intro.md"), []byte(introContent), 0644)

	fmt.Printf("✓ Week 생성됨: %s/%s\n", filepath.Base(partDir), folderName)
}

func addEpisode(root string, partNum, weekNum int, title string) {
	// 파트 폴더 찾기
	partDir := findDirByPrefix(root, fmt.Sprintf("part%02d", partNum))
	if partDir == "" {
		fmt.Printf("Error: part%02d를 찾을 수 없습니다.\n", partNum)
		os.Exit(1)
	}

	// 주차 폴더 찾기
	weekDir := findDirByPrefix(partDir, fmt.Sprintf("week%02d", weekNum))
	if weekDir == "" {
		fmt.Printf("Error: week%02d를 찾을 수 없습니다.\n", weekNum)
		os.Exit(1)
	}

	num := findNextNumber(weekDir, "ep")
	folderName := fmt.Sprintf("ep%02d_%s", num, sanitizeName(title))
	epDir := filepath.Join(weekDir, folderName)

	if err := os.MkdirAll(filepath.Join(epDir, "variants"), 0755); err != nil {
		fmt.Printf("Error creating directory: %v\n", err)
		os.Exit(1)
	}

	// meta.yaml
	meta := map[string]interface{}{
		"title":            title,
		"order":            num,
		"week":             weekNum,
		"part":             partNum,
		"status":           "draft",
		"selected_variant": nil,
	}
	writeYAML(filepath.Join(epDir, "meta.yaml"), meta)

	// conversation.md
	convContent := ":::conversation\n**한입**: \n\n**N**: \n:::\n"
	os.WriteFile(filepath.Join(epDir, "conversation.md"), []byte(convContent), 0644)

	// yama.md
	yamaContent := ":::yama\n{핵심 메시지}\n:::\n"
	os.WriteFile(filepath.Join(epDir, "yama.md"), []byte(yamaContent), 0644)

	// body.md
	bodyContent := fmt.Sprintf("# %s\n\n## 개념 설명\n\n{설명}\n\n## 실전 팁\n\n{팁}\n", title)
	os.WriteFile(filepath.Join(epDir, "body.md"), []byte(bodyContent), 0644)

	fmt.Printf("✓ Episode 생성됨: %s\n", folderName)
	fmt.Printf("  - meta.yaml\n  - conversation.md\n  - yama.md\n  - body.md\n  - variants/\n")
}

func addVariant(root, epPath, version string) {
	// 절대 경로 또는 상대 경로 처리
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

	// 각 파일의 variant 버전 생성
	files := []string{"conversation", "yama", "body"}
	for _, f := range files {
		srcFile := filepath.Join(epDir, f+".md")
		dstFile := filepath.Join(varDir, fmt.Sprintf("%s_%s.md", version, f))

		// 원본 파일이 있으면 복사, 없으면 빈 템플릿
		if content, err := os.ReadFile(srcFile); err == nil {
			os.WriteFile(dstFile, content, 0644)
		} else {
			os.WriteFile(dstFile, []byte(fmt.Sprintf("# %s variant\n", f)), 0644)
		}
	}

	fmt.Printf("✓ Variant 생성됨: %s\n", version)
	fmt.Printf("  - %s_conversation.md\n  - %s_yama.md\n  - %s_body.md\n", version, version, version)
}

func findDirByPrefix(parent, prefix string) string {
	entries, _ := os.ReadDir(parent)
	for _, e := range entries {
		if e.IsDir() && strings.HasPrefix(e.Name(), prefix) {
			return filepath.Join(parent, e.Name())
		}
	}
	return ""
}

func writeYAML(path string, data map[string]interface{}) {
	out, _ := yaml.Marshal(data)
	os.WriteFile(path, out, 0644)
}

func handleList(root string) {
	fmt.Println("\n📚 프로젝트 구조:\n")
	printTree(root, "", true)
}

func printTree(path string, prefix string, isRoot bool) {
	entries, _ := os.ReadDir(path)

	// 디렉토리만 필터링 (templates 제외)
	var dirs []os.DirEntry
	for _, e := range entries {
		if e.IsDir() && !strings.HasPrefix(e.Name(), "_") && !strings.HasPrefix(e.Name(), ".") {
			dirs = append(dirs, e)
		}
	}

	for i, e := range dirs {
		isLast := i == len(dirs)-1
		connector := "├── "
		if isLast {
			connector = "└── "
		}

		name := e.Name()
		// 아이콘 추가
		icon := "📁"
		if strings.HasPrefix(name, "part") {
			icon = "📖"
		} else if strings.HasPrefix(name, "week") {
			icon = "📅"
		} else if strings.HasPrefix(name, "ep") {
			icon = "📝"
		} else if name == "variants" {
			icon = "🔀"
		}

		if !isRoot {
			fmt.Printf("%s%s%s %s\n", prefix, connector, icon, name)
		} else {
			fmt.Printf("%s %s\n", icon, name)
		}

		newPrefix := prefix
		if !isRoot {
			if isLast {
				newPrefix += "    "
			} else {
				newPrefix += "│   "
			}
		}

		// variants는 하위 표시 안함
		if name != "variants" {
			printTree(filepath.Join(path, name), newPrefix, false)
		}
	}
}
