import styled from '@emotion/styled';
import { useState } from 'react';
import type { ContentTree, Part, Week, Episode } from '../../types';

interface TreeViewProps {
  tree: ContentTree | null;
  onSelectFile: (path: string, name: string) => void;
  selectedPath: string | null;
}

const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 8px;
  font-size: 13px;
  color: #cccccc;
  background: #252526;
`;

const TreeNode = styled.div<{ level: number; selected?: boolean }>`
  padding: 4px 8px;
  padding-left: ${props => 8 + props.level * 16}px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.selected ? '#37373d' : 'transparent'};

  &:hover {
    background: #2a2d2e;
  }
`;

const Icon = styled.span`
  font-size: 14px;
`;

const Label = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const VariantBadge = styled.span`
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background: #0078d4;
  color: white;
  margin-left: auto;
`;

const Chevron = styled.span<{ expanded: boolean }>`
  display: inline-block;
  transition: transform 0.15s;
  transform: rotate(${props => props.expanded ? 90 : 0}deg);
  font-size: 10px;
  color: #808080;
`;

export function TreeView({ tree, onSelectFile, selectedPath }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (path: string) => {
    const next = new Set(expanded);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setExpanded(next);
  };

  if (!tree) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container>
      {tree.parts.map(part => (
        <PartNode
          key={part.path}
          part={part}
          expanded={expanded}
          toggleExpand={toggleExpand}
          onSelectFile={onSelectFile}
          selectedPath={selectedPath}
        />
      ))}
    </Container>
  );
}

function PartNode({
  part,
  expanded,
  toggleExpand,
  onSelectFile,
  selectedPath,
}: {
  part: Part;
  expanded: Set<string>;
  toggleExpand: (path: string) => void;
  onSelectFile: (path: string, name: string) => void;
  selectedPath: string | null;
}) {
  const isExpanded = expanded.has(part.path);

  return (
    <>
      <TreeNode level={0} onClick={() => toggleExpand(part.path)}>
        <Chevron expanded={isExpanded}>▶</Chevron>
        <Icon>📖</Icon>
        <Label>{part.title}</Label>
      </TreeNode>
      {isExpanded &&
        part.weeks.map(week => (
          <WeekNode
            key={week.path}
            week={week}
            partPath={part.path}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
          />
        ))}
    </>
  );
}

function WeekNode({
  week,
  partPath,
  expanded,
  toggleExpand,
  onSelectFile,
  selectedPath,
}: {
  week: Week;
  partPath: string;
  expanded: Set<string>;
  toggleExpand: (path: string) => void;
  onSelectFile: (path: string, name: string) => void;
  selectedPath: string | null;
}) {
  const fullPath = `${partPath}/${week.path}`;
  const isExpanded = expanded.has(fullPath);

  return (
    <>
      <TreeNode level={1} onClick={() => toggleExpand(fullPath)}>
        <Chevron expanded={isExpanded}>▶</Chevron>
        <Icon>📅</Icon>
        <Label>{week.title}</Label>
      </TreeNode>
      {isExpanded &&
        week.episodes.map(ep => (
          <EpisodeNode
            key={ep.path}
            episode={ep}
            weekPath={fullPath}
            expanded={expanded}
            toggleExpand={toggleExpand}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
          />
        ))}
    </>
  );
}

function EpisodeNode({
  episode,
  weekPath,
  expanded,
  toggleExpand,
  onSelectFile,
  selectedPath,
}: {
  episode: Episode;
  weekPath: string;
  expanded: Set<string>;
  toggleExpand: (path: string) => void;
  onSelectFile: (path: string, name: string) => void;
  selectedPath: string | null;
}) {
  const fullPath = `${weekPath}/${episode.path}`;
  const isExpanded = expanded.has(fullPath);
  const hasVariants = episode.variants && episode.variants.length > 0;

  return (
    <>
      <TreeNode
        level={2}
        onClick={() => hasVariants && toggleExpand(fullPath)}
      >
        {hasVariants ? (
          <Chevron expanded={isExpanded}>▶</Chevron>
        ) : (
          <span style={{ width: 10 }} />
        )}
        <Icon>📝</Icon>
        <Label>{episode.title}</Label>
        {hasVariants && (
          <VariantBadge>{episode.variants.length}v</VariantBadge>
        )}
      </TreeNode>
      {isExpanded &&
        episode.variants.map(variant => {
          const variantPath = `${fullPath}/variants/${variant}/source.md`;
          const isSelected = selectedPath === variantPath;
          return (
            <TreeNode
              key={variant}
              level={3}
              selected={isSelected}
              onClick={() =>
                onSelectFile(variantPath, `${episode.title} (${variant})`)
              }
            >
              <span style={{ width: 10 }} />
              <Icon>🔀</Icon>
              <Label>{variant}</Label>
            </TreeNode>
          );
        })}
    </>
  );
}
