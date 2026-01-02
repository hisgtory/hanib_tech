import styled from '@emotion/styled';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ContentTree } from '../../types';

interface TreeViewProps {
  tree: ContentTree | null;
  onSelectFile: (path: string, name: string) => void;
  onSelectFileWithFocus?: (path: string, name: string) => void;
  onSelectEpisodeMerged?: (path: string, name: string) => void;
  selectedPath: string | null;
}

interface TreeItem {
  id: string;
  type: 'part' | 'week' | 'episode' | 'file' | 'variant' | 'variant-file';
  path: string;
  displayName: string;
  level: number;
  isExpandable: boolean;
  parentPath?: string;
}

const Container = styled.div`
  height: 100%;
  overflow-y: auto;
  padding: 8px;
  font-size: 13px;
  color: #cccccc;
  background: #252526;
  outline: none;

  &:focus {
    outline: none;
  }
`;

const TreeNode = styled.div<{ level: number; selected?: boolean; focused?: boolean; draggable?: boolean }>`
  padding: 4px 8px;
  padding-left: ${props => 8 + props.level * 16}px;
  cursor: ${props => props.draggable ? 'grab' : 'pointer'};
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.selected ? '#37373d' : props.focused ? '#2a2d2e' : 'transparent'};
  outline: ${props => props.focused ? '1px solid #007acc' : 'none'};
  outline-offset: -1px;

  &:hover {
    background: #2a2d2e;
  }

  &:active {
    cursor: ${props => props.draggable ? 'grabbing' : 'pointer'};
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

function getFileIcon(filename: string): string {
  if (filename.includes('conversation')) return '💬';
  if (filename.includes('yama')) return '⭐';
  if (filename.includes('body')) return '📄';
  return '📄';
}

function getNodeIcon(type: TreeItem['type'], filename?: string): string {
  switch (type) {
    case 'part': return '📖';
    case 'week': return '📅';
    case 'episode': return '📝';
    case 'variant': return '🔀';
    case 'file':
    case 'variant-file':
      return getFileIcon(filename || '');
    default: return '📄';
  }
}

export function TreeView({ tree, onSelectFile, onSelectFileWithFocus, onSelectEpisodeMerged, selectedPath }: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Build flat list of visible items
  const visibleItems = useMemo(() => {
    if (!tree) return [];

    const items: TreeItem[] = [];

    for (const part of tree.parts) {
      items.push({
        id: part.path,
        type: 'part',
        path: part.path,
        displayName: part.title,
        level: 0,
        isExpandable: true,
      });

      if (expanded.has(part.path)) {
        for (const week of part.weeks) {
          const weekFullPath = `${part.path}/${week.path}`;
          items.push({
            id: weekFullPath,
            type: 'week',
            path: weekFullPath,
            displayName: week.title,
            level: 1,
            isExpandable: true,
            parentPath: part.path,
          });

          if (expanded.has(weekFullPath)) {
            for (const episode of week.episodes) {
              const epFullPath = `${weekFullPath}/${episode.path}`;
              const hasFiles = episode.files && episode.files.length > 0;
              const hasVariants = episode.variants && episode.variants.length > 0;

              items.push({
                id: epFullPath,
                type: 'episode',
                path: epFullPath,
                displayName: episode.title,
                level: 2,
                isExpandable: hasFiles || hasVariants,
                parentPath: weekFullPath,
              });

              if (expanded.has(epFullPath)) {
                // Files
                if (hasFiles) {
                  for (const file of episode.files) {
                    const filePath = `${epFullPath}/${file}`;
                    items.push({
                      id: filePath,
                      type: 'file',
                      path: filePath,
                      displayName: `${episode.title} - ${file}`,
                      level: 3,
                      isExpandable: false,
                      parentPath: epFullPath,
                    });
                  }
                }
                // Variants
                if (hasVariants) {
                  for (const variant of episode.variants) {
                    const variantPath = `${epFullPath}/variants/${variant.name}`;
                    const hasVarFiles = variant.files && variant.files.length > 0;

                    items.push({
                      id: variantPath,
                      type: 'variant',
                      path: variantPath,
                      displayName: variant.name,
                      level: 3,
                      isExpandable: hasVarFiles,
                      parentPath: epFullPath,
                    });

                    if (expanded.has(variantPath) && hasVarFiles) {
                      for (const file of variant.files) {
                        const filePath = `${variantPath}/${file}`;
                        items.push({
                          id: filePath,
                          type: 'variant-file',
                          path: filePath,
                          displayName: `${episode.title} (${variant.name}) - ${file}`,
                          level: 4,
                          isExpandable: false,
                          parentPath: variantPath,
                        });
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return items;
  }, [tree, expanded]);

  const toggleExpand = useCallback((path: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (visibleItems.length === 0) return;

    const currentIndex = focusedId
      ? visibleItems.findIndex(item => item.id === focusedId)
      : -1;
    const currentItem = currentIndex >= 0 ? visibleItems[currentIndex] : null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < visibleItems.length - 1) {
          const nextItem = visibleItems[currentIndex + 1];
          setFocusedId(nextItem.id);
          itemRefs.current.get(nextItem.id)?.scrollIntoView({ block: 'nearest' });
        } else if (currentIndex === -1 && visibleItems.length > 0) {
          setFocusedId(visibleItems[0].id);
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          const prevItem = visibleItems[currentIndex - 1];
          setFocusedId(prevItem.id);
          itemRefs.current.get(prevItem.id)?.scrollIntoView({ block: 'nearest' });
        } else if (currentIndex === -1 && visibleItems.length > 0) {
          setFocusedId(visibleItems[visibleItems.length - 1].id);
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (currentItem?.isExpandable && !expanded.has(currentItem.path)) {
          toggleExpand(currentItem.path);
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (currentItem) {
          if (currentItem.isExpandable && expanded.has(currentItem.path)) {
            toggleExpand(currentItem.path);
          } else if (currentItem.parentPath) {
            setFocusedId(currentItem.parentPath);
            itemRefs.current.get(currentItem.parentPath)?.scrollIntoView({ block: 'nearest' });
          }
        }
        break;

      case 'Enter':
        e.preventDefault();
        if (currentItem) {
          if (currentItem.type === 'file' || currentItem.type === 'variant-file') {
            // Cmd+Enter: open file and focus editor
            if (e.metaKey && onSelectFileWithFocus) {
              onSelectFileWithFocus(currentItem.path, currentItem.displayName);
            } else {
              onSelectFile(currentItem.path, currentItem.displayName);
            }
          } else if (currentItem.type === 'episode') {
            // Cmd+Enter on episode: show merged view
            if (e.metaKey && onSelectEpisodeMerged) {
              onSelectEpisodeMerged(currentItem.path, currentItem.displayName);
            } else {
              toggleExpand(currentItem.path);
            }
          } else if (currentItem.isExpandable) {
            toggleExpand(currentItem.path);
          }
        }
        break;
    }
  }, [visibleItems, focusedId, expanded, toggleExpand, onSelectFile, onSelectFileWithFocus, onSelectEpisodeMerged]);

  // Focus container on Escape from anywhere
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        containerRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedId) {
      itemRefs.current.get(focusedId)?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedId]);

  // Auto-expand to selectedPath when page loads or URL changes
  useEffect(() => {
    if (!selectedPath || !tree) return;

    // Parse path to get all parent paths that need to be expanded
    const parts = selectedPath.split('/');
    const pathsToExpand: string[] = [];

    // Build parent paths: part01, part01/week01, part01/week01/ep01, etc.
    // Don't include the file itself (last segment for files)
    for (let i = 1; i <= parts.length - 1; i++) {
      const parentPath = parts.slice(0, i).join('/');
      if (parentPath) {
        pathsToExpand.push(parentPath);
      }
    }

    // Add all parent paths to expanded set
    if (pathsToExpand.length > 0) {
      setExpanded(prev => {
        const next = new Set(prev);
        pathsToExpand.forEach(p => next.add(p));
        return next;
      });

      // Scroll selected item into view after expansion (small delay for DOM update)
      setTimeout(() => {
        itemRefs.current.get(selectedPath)?.scrollIntoView({ block: 'center' });
      }, 50);
    }
  }, [selectedPath, tree]);

  if (!tree) {
    return <Container>Loading...</Container>;
  }

  return (
    <Container
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (!focusedId && visibleItems.length > 0) {
          setFocusedId(visibleItems[0].id);
        }
      }}
    >
      {visibleItems.map(item => (
        <TreeNode
          key={item.id}
          ref={el => {
            if (el) itemRefs.current.set(item.id, el);
            else itemRefs.current.delete(item.id);
          }}
          level={item.level}
          selected={selectedPath === item.path}
          focused={focusedId === item.id}
          draggable={item.type === 'file' || item.type === 'variant-file'}
          onClick={(e) => {
            setFocusedId(item.id);
            if (item.type === 'file' || item.type === 'variant-file') {
              if (e.metaKey && onSelectFileWithFocus) {
                onSelectFileWithFocus(item.path, item.displayName);
              } else {
                onSelectFile(item.path, item.displayName);
              }
            } else if (item.type === 'episode') {
              if (e.metaKey && onSelectEpisodeMerged) {
                onSelectEpisodeMerged(item.path, item.displayName);
              } else {
                toggleExpand(item.path);
              }
            } else if (item.isExpandable) {
              toggleExpand(item.path);
            }
          }}
          onDragStart={item.type === 'file' || item.type === 'variant-file' ? (e) => {
            e.dataTransfer.setData('application/json', JSON.stringify({
              path: item.path,
              name: item.displayName,
            }));
            e.dataTransfer.effectAllowed = 'copy';
          } : undefined}
        >
          {item.isExpandable ? (
            <Chevron expanded={expanded.has(item.path)}>▶</Chevron>
          ) : (
            <span style={{ width: 10 }} />
          )}
          <Icon>{getNodeIcon(item.type, item.path.split('/').pop())}</Icon>
          <Label>{item.type === 'file' || item.type === 'variant-file' ? item.path.split('/').pop() : item.displayName}</Label>
          {item.type === 'episode' && tree.parts
            .flatMap(p => p.weeks)
            .flatMap(w => w.episodes)
            .find(e => `${e.path}` === item.path.split('/').pop())?.variants?.length ? (
            <VariantBadge>
              {tree.parts
                .flatMap(p => p.weeks)
                .flatMap(w => w.episodes)
                .find(e => item.path.endsWith(e.path))?.variants?.length}v
            </VariantBadge>
          ) : null}
        </TreeNode>
      ))}
    </Container>
  );
}
