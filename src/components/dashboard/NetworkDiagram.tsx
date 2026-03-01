'use client';

import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, Edge, Node, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProjects } from '@/lib/ProjectContext';
import ActivityNode from './ActivityNode';

const nodeTypes = {
    activity: ActivityNode,
};

interface NetworkDiagramProps {
    projectId: string;
}

export default function NetworkDiagram({ projectId }: NetworkDiagramProps) {
    const { activities } = useProjects();

    const { nodes, edges } = useMemo(() => {
        const projectActivities = activities.filter(a => a.projectId === projectId);

        // Calculate levels for DAG
        const levels = new Map<string, number>();
        const activitiesMap = new Map();
        projectActivities.forEach(a => activitiesMap.set(a.id, a));

        let changed = true;
        while (changed) {
            changed = false;
            projectActivities.forEach(a => {
                if (!levels.has(a.id)) {
                    if (a.predecessors.length === 0) {
                        levels.set(a.id, 0);
                        changed = true;
                    } else {
                        // Check if all predecessors have a level
                        const allPredsHaveLevels = a.predecessors.every(pId => levels.has(pId));
                        if (allPredsHaveLevels) {
                            const maxPredLevel = Math.max(...a.predecessors.map(pId => levels.get(pId) || 0));
                            levels.set(a.id, maxPredLevel + 1);
                            changed = true;
                        }
                    }
                }
            });
        }

        // Now group by level to assign Y positions
        const levelCounts = new Map<number, number>();

        const calculatedNodes: Node[] = projectActivities.map(activity => {
            const level = levels.get(activity.id) || 0;
            const countIndex = levelCounts.get(level) || 0;
            levelCounts.set(level, countIndex + 1);

            return {
                id: activity.id,
                type: 'activity',
                position: { x: level * 300, y: countIndex * 150 + 50 },
                data: { activity }
            };
        });

        const calculatedEdges: Edge[] = [];
        projectActivities.forEach(activity => {
            activity.successors.forEach(succId => {
                calculatedEdges.push({
                    id: `e-${activity.id}-${succId}`,
                    source: activity.id,
                    target: succId,
                    animated: activity.status === 'active' || activitiesMap.get(succId)?.status === 'active',
                    type: 'smoothstep',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        width: 20,
                        height: 20,
                        color: '#94a3b8',
                    },
                    style: {
                        strokeWidth: 2,
                        stroke: '#94a3b8',
                    }
                });
            });
        });

        return { nodes: calculatedNodes, edges: calculatedEdges };
    }, [projectId, activities]);

    if (nodes.length === 0) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No activities found for this project.
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', flex: 1, minHeight: 0 }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-right"
            >
                <Background color="#ccc" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
