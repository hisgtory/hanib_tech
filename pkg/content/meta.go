package content

import (
	"os"

	"gopkg.in/yaml.v3"
)

// Meta represents metadata for parts, weeks, or episodes
type Meta struct {
	Title           string   `yaml:"title" json:"title"`
	Order           int      `yaml:"order" json:"order"`
	Description     string   `yaml:"description,omitempty" json:"description,omitempty"`
	Part            int      `yaml:"part,omitempty" json:"part,omitempty"`
	Week            int      `yaml:"week,omitempty" json:"week,omitempty"`
	Keywords        []string `yaml:"keywords,omitempty" json:"keywords,omitempty"`
	Status          string   `yaml:"status,omitempty" json:"status,omitempty"`
	SelectedVariant *string  `yaml:"selected_variant,omitempty" json:"selected_variant,omitempty"`
}

// LoadMeta loads metadata from a YAML file
func LoadMeta(path string) (*Meta, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var meta Meta
	if err := yaml.Unmarshal(data, &meta); err != nil {
		return nil, err
	}

	return &meta, nil
}

// SaveMeta saves metadata to a YAML file
func SaveMeta(path string, meta *Meta) error {
	data, err := yaml.Marshal(meta)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

// SaveMetaMap saves a generic map as YAML
func SaveMetaMap(path string, data map[string]interface{}) error {
	out, err := yaml.Marshal(data)
	if err != nil {
		return err
	}
	return os.WriteFile(path, out, 0644)
}
