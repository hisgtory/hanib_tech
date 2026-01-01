package content

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// Part represents a book part (partNN_title)
type Part struct {
	Path  string `json:"path"`
	Title string `json:"title"`
	Order int    `json:"order"`
	Weeks []Week `json:"weeks"`
}

// Week represents a week within a part
type Week struct {
	Path     string    `json:"path"`
	Title    string    `json:"title"`
	Order    int       `json:"order"`
	Episodes []Episode `json:"episodes"`
}

// Variant represents a variant folder with its files
type Variant struct {
	Name  string   `json:"name"`
	Files []string `json:"files"`
}

// Episode represents an episode within a week
type Episode struct {
	Path     string    `json:"path"`
	Title    string    `json:"title"`
	Order    int       `json:"order"`
	Status   string    `json:"status"`
	Files    []string  `json:"files"`    // Episode-level files (body.md, conversation.md, yama.md)
	Variants []Variant `json:"variants"` // Variant folders with their files
}

// ContentTree represents the full content structure
type ContentTree struct {
	Root  string `json:"root"`
	Parts []Part `json:"parts"`
}

// LoadTree loads the content tree from the given root directory
func LoadTree(root string) (*ContentTree, error) {
	tree := &ContentTree{Root: root}

	// Find all parts
	entries, err := os.ReadDir(root)
	if err != nil {
		return nil, err
	}

	partRe := regexp.MustCompile(`^part(\d+)_(.+)$`)
	weekRe := regexp.MustCompile(`^week(\d+)_(.+)$`)
	epRe := regexp.MustCompile(`^ep(\d+)_(.+)$`)

	for _, e := range entries {
		if !e.IsDir() {
			continue
		}

		matches := partRe.FindStringSubmatch(e.Name())
		if matches == nil {
			continue
		}

		partNum, _ := strconv.Atoi(matches[1])
		partPath := filepath.Join(root, e.Name())

		part := Part{
			Path:  e.Name(),
			Title: cleanTitle(matches[2]),
			Order: partNum,
		}

		// Load meta if exists
		meta, err := LoadMeta(filepath.Join(partPath, "meta.yaml"))
		if err == nil && meta.Title != "" {
			part.Title = meta.Title
		}

		// Find weeks
		weekEntries, _ := os.ReadDir(partPath)
		for _, we := range weekEntries {
			if !we.IsDir() {
				continue
			}

			weekMatches := weekRe.FindStringSubmatch(we.Name())
			if weekMatches == nil {
				continue
			}

			weekNum, _ := strconv.Atoi(weekMatches[1])
			weekPath := filepath.Join(partPath, we.Name())

			week := Week{
				Path:  we.Name(),
				Title: cleanTitle(weekMatches[2]),
				Order: weekNum,
			}

			// Load week meta
			weekMeta, err := LoadMeta(filepath.Join(weekPath, "meta.yaml"))
			if err == nil && weekMeta.Title != "" {
				week.Title = weekMeta.Title
			}

			// Find episodes
			epEntries, _ := os.ReadDir(weekPath)
			for _, ee := range epEntries {
				if !ee.IsDir() {
					continue
				}

				epMatches := epRe.FindStringSubmatch(ee.Name())
				if epMatches == nil {
					continue
				}

				epNum, _ := strconv.Atoi(epMatches[1])
				epPath := filepath.Join(weekPath, ee.Name())

				ep := Episode{
					Path:   ee.Name(),
					Title:  cleanTitle(epMatches[2]),
					Order:  epNum,
					Status: "draft",
				}

				// Load episode meta
				epMeta, err := LoadMeta(filepath.Join(epPath, "meta.yaml"))
				if err == nil {
					if epMeta.Title != "" {
						ep.Title = epMeta.Title
					}
					if epMeta.Status != "" {
						ep.Status = epMeta.Status
					}
				}

				// Find episode-level files
				epFiles, _ := os.ReadDir(epPath)
				for _, ef := range epFiles {
					if !ef.IsDir() && strings.HasSuffix(ef.Name(), ".md") {
						ep.Files = append(ep.Files, ef.Name())
					}
				}
				sort.Strings(ep.Files)

				// Find variants (ALL directories, not just "v" prefix)
				variantsPath := filepath.Join(epPath, "variants")
				if varEntries, err := os.ReadDir(variantsPath); err == nil {
					for _, ve := range varEntries {
						if ve.IsDir() {
							variant := Variant{Name: ve.Name()}
							// Find files inside variant
							varPath := filepath.Join(variantsPath, ve.Name())
							if varFiles, err := os.ReadDir(varPath); err == nil {
								for _, vf := range varFiles {
									if !vf.IsDir() && strings.HasSuffix(vf.Name(), ".md") {
										variant.Files = append(variant.Files, vf.Name())
									}
								}
								sort.Strings(variant.Files)
							}
							ep.Variants = append(ep.Variants, variant)
						}
					}
					// Sort variants by name
					sort.Slice(ep.Variants, func(i, j int) bool {
						return ep.Variants[i].Name < ep.Variants[j].Name
					})
				}

				week.Episodes = append(week.Episodes, ep)
			}

			// Sort episodes by order
			sort.Slice(week.Episodes, func(i, j int) bool {
				return week.Episodes[i].Order < week.Episodes[j].Order
			})

			part.Weeks = append(part.Weeks, week)
		}

		// Sort weeks by order
		sort.Slice(part.Weeks, func(i, j int) bool {
			return part.Weeks[i].Order < part.Weeks[j].Order
		})

		tree.Parts = append(tree.Parts, part)
	}

	// Sort parts by order
	sort.Slice(tree.Parts, func(i, j int) bool {
		return tree.Parts[i].Order < tree.Parts[j].Order
	})

	return tree, nil
}

// cleanTitle converts folder name format to readable title
func cleanTitle(name string) string {
	return strings.ReplaceAll(name, "_", " ")
}

// SanitizeName converts a title to a valid folder name
func SanitizeName(name string) string {
	re := regexp.MustCompile(`[^\w가-힣\s]`)
	name = re.ReplaceAllString(name, "")
	return strings.ReplaceAll(strings.TrimSpace(name), " ", "_")
}

// FindNextNumber finds the next available number for a given prefix
func FindNextNumber(dir, prefix string) int {
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

// FindDirByPrefix finds a directory matching the given prefix
func FindDirByPrefix(parent, prefix string) string {
	entries, _ := os.ReadDir(parent)
	for _, e := range entries {
		if e.IsDir() && strings.HasPrefix(e.Name(), prefix) {
			return filepath.Join(parent, e.Name())
		}
	}
	return ""
}
