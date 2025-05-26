import React, { useMemo } from "react";
import ReactFlow, { Node, Edge, Controls, Position } from "reactflow";
import "reactflow/dist/style.css";
import EventNode from "./EventNode";
import calculateCPM from "../app/utils/cpm"; // Adjust the import path as needed

interface EventData {
  name: string;
  duration: number;
  predecessors?: string;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  timeReserve: number;
}

interface EventGraphProps {
  events: {
    name: string;
    duration: number;
    predecessors?: string;
  }[];
}

export default function EventGraph({ events }: EventGraphProps) {
  const { nodes, edges } = useMemo(() => {
    // --- Initialization ---
    const eventMap = new Map<string, EventData>();
    const predecessorsMap = new Map<string, string[]>();
    const successorsMap = new Map<string, string[]>();

    // Initialize maps and event data structure
    events.forEach((event) => {
      const predecessorsList = event.predecessors
        ? event.predecessors
            .trim()
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p !== "")
        : [];
      predecessorsMap.set(event.name, predecessorsList);
      successorsMap.set(event.name, []); // Initialize successors list

      // Initialize event data with default CPM values
      eventMap.set(event.name, {
        ...event,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: Infinity, // Initialize late times to infinity
        lateFinish: Infinity,
        timeReserve: 0,
      });
    });

    // Build successors map
    events.forEach((event) => {
      const predecessorsList = predecessorsMap.get(event.name) || [];
      predecessorsList.forEach((predName) => {
        if (successorsMap.has(predName)) {
          successorsMap.get(predName)?.push(event.name);
        } else {
           // Handle case where predecessor might not be in the events list (error state)
           console.warn(`Predecessor "${predName}" for event "${event.name}" not found.`);
        }
      });
    });

    // Add virtual START and END nodes to maps
    const startNodeData: EventData = { name: 'START', duration: 0, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, timeReserve: 0 };
    const endNodeData: EventData = { name: 'END', duration: 0, earlyStart: 0, earlyFinish: 0, lateStart: Infinity, lateFinish: Infinity, timeReserve: 0 };
    eventMap.set('start', startNodeData);
    eventMap.set('end', endNodeData);
    predecessorsMap.set('start', []);
    successorsMap.set('start', []);
    predecessorsMap.set('end', []);
    successorsMap.set('end', []);


    // Connect nodes without predecessors to START
    events.forEach(event => {
        if ((predecessorsMap.get(event.name) || []).length === 0) {
            successorsMap.get('start')?.push(event.name);
            predecessorsMap.set(event.name, ['start']);
        }
    });

    // Connect nodes without successors to END
    const nodesWithNoSuccessors = events
        .map(e => e.name)
        .filter(name => (successorsMap.get(name) || []).length === 0);

    nodesWithNoSuccessors.forEach(name => {
        successorsMap.get(name)?.push('end');
        predecessorsMap.get('end')?.push(name);
    });


    // --- Forward Pass (Calculate ES, EF) ---
    const nodeQueue = ['start']; // Start with the initial node
    const processedNodes = new Set<string>();

    while (nodeQueue.length > 0) {
        const currentName = nodeQueue.shift()!;
        if (processedNodes.has(currentName)) continue; // Avoid reprocessing

        const currentNodeData = eventMap.get(currentName)!;
        const predecessors = predecessorsMap.get(currentName) || [];

        // Calculate Early Start (ES)
        let calculatedES = 0;
        if (currentName !== 'start') {
            calculatedES = Math.max(0, ...predecessors.map(predName => eventMap.get(predName)?.earlyFinish ?? 0));
        }
        currentNodeData.earlyStart = calculatedES;

        // Calculate Early Finish (EF)
        currentNodeData.earlyFinish = currentNodeData.earlyStart + currentNodeData.duration;

        processedNodes.add(currentName);

        // Add successors to the queue if all their predecessors are processed
        const successors = successorsMap.get(currentName) || [];
        successors.forEach(succName => {
            const succPredecessors = predecessorsMap.get(succName) || [];
            if (succPredecessors.every(pred => processedNodes.has(pred))) {
                if (!nodeQueue.includes(succName)) { // Add only if not already queued
                   nodeQueue.push(succName);
                }
            }
        });

        // Ensure queue is sorted topologically (by ES primarily, then name for stability)
        nodeQueue.sort((a, b) => {
            const esA = eventMap.get(a)?.earlyStart ?? 0;
            const esB = eventMap.get(b)?.earlyStart ?? 0;
            if (esA !== esB) return esA - esB;
            return a.localeCompare(b); // Fallback sort by name
        });
    }


    // --- Backward Pass (Calculate LF, LS) ---
    const endNode = eventMap.get('end')!;
    const projectDuration = endNode.earlyFinish; // EF of END node is the project duration
    endNode.lateFinish = projectDuration;
    endNode.lateStart = projectDuration; // LF - duration (0 for END)

    const reverseNodeQueue = ['end']; // Start with the final node
    const reverseProcessedNodes = new Set<string>();

    while (reverseNodeQueue.length > 0) {
        const currentName = reverseNodeQueue.shift()!;
         if (reverseProcessedNodes.has(currentName)) continue; // Avoid reprocessing

        const currentNodeData = eventMap.get(currentName)!;
        const successors = successorsMap.get(currentName) || [];

        // Calculate Late Finish (LF)
        let calculatedLF = projectDuration; // Default to project duration
         if (currentName !== 'end') {
            calculatedLF = Math.min(projectDuration, ...successors.map(succName => eventMap.get(succName)?.lateStart ?? projectDuration));
        }
        currentNodeData.lateFinish = calculatedLF;


        // Calculate Late Start (LS)
        currentNodeData.lateStart = currentNodeData.lateFinish - currentNodeData.duration;

        reverseProcessedNodes.add(currentName);

        // Add predecessors to the queue if all their successors are processed
        const predecessors = predecessorsMap.get(currentName) || [];
        predecessors.forEach(predName => {
            const predSuccessors = successorsMap.get(predName) || [];
             if (predSuccessors.every(succ => reverseProcessedNodes.has(succ))) {
                 if (!reverseNodeQueue.includes(predName)) {
                    reverseNodeQueue.push(predName);
                 }
            }
        });

         // Ensure queue is sorted reverse topologically (by LF primarily, then name)
        reverseNodeQueue.sort((a, b) => {
            const lfA = eventMap.get(a)?.lateFinish ?? projectDuration;
            const lfB = eventMap.get(b)?.lateFinish ?? projectDuration;
            if (lfA !== lfB) return lfB - lfA; // Sort descending by LF
            return b.localeCompare(a); // Fallback sort by name
        });
    }

    // --- Calculate Time Reserve (Slack) ---
    eventMap.forEach(nodeData => {
        nodeData.timeReserve = nodeData.lateFinish - nodeData.earlyFinish;
        // Handle potential floating point inaccuracies
        if (Math.abs(nodeData.timeReserve) < 1e-9) {
            nodeData.timeReserve = 0;
        }
    });


    // --- Node Positioning (Simple Level-Based Layout) ---
    const levelMap = new Map<string, number>();
    const nodesToProcess = ['start'];
    const processedForLevel = new Set<string>();
    levelMap.set('start', 0);
    processedForLevel.add('start');

    let currentLevel = 0;
    while(nodesToProcess.length > 0) {
        const nodesAtCurrentLevel = [...nodesToProcess];
        nodesToProcess.length = 0; // Clear for next level

        nodesAtCurrentLevel.forEach(nodeName => {
            const successors = successorsMap.get(nodeName) || [];
            successors.forEach(succName => {
                if (!processedForLevel.has(succName)) {
                    // Check if all predecessors are at this level or lower
                    const succPredecessors = predecessorsMap.get(succName) || [];
                    if (succPredecessors.every(pred => levelMap.has(pred) && levelMap.get(pred)! <= currentLevel)) {
                         levelMap.set(succName, currentLevel + 1);
                         nodesToProcess.push(succName);
                         processedForLevel.add(succName);
                    }
                }
            });
        });
        currentLevel++;
         // Sort nodes for next level processing based on ES for better layout consistency
        nodesToProcess.sort((a, b) => (eventMap.get(a)?.earlyStart ?? 0) - (eventMap.get(b)?.earlyStart ?? 0));
    }

     // Ensure END node gets the highest level
    const maxEventLevel = Math.max(0, ...Array.from(levelMap.values()).filter(l => l !== undefined && l !== Infinity));
    levelMap.set('end', maxEventLevel + 1);


    const nodesPerLevel = new Map<number, number>();
    levelMap.forEach(level => {
        nodesPerLevel.set(level, (nodesPerLevel.get(level) || 0) + 1);
    });

    const currentYPositionInLevel = new Map<number, number>();
    const nodeLayout: Node[] = [];

    // Create React Flow Nodes
    Array.from(eventMap.keys()).sort((a, b) => (levelMap.get(a) ?? 0) - (levelMap.get(b) ?? 0)).forEach(nodeName => {
        const nodeData = eventMap.get(nodeName)!;
        const level = levelMap.get(nodeName) ?? 0;
        const nodesInLevel = nodesPerLevel.get(level) || 1;
        const yPosIndex = currentYPositionInLevel.get(level) || 0;
        currentYPositionInLevel.set(level, yPosIndex + 1);

        const x = 50 + level * 250; // Increased spacing
        const y = 50 + yPosIndex * 150 + (level % 2) * 50; // Simple vertical distribution + stagger

        nodeLayout.push({
            id: nodeName,
            type: 'eventNode', // Use your custom node type
            position: { x, y },
            data: nodeData, // Pass calculated CPM data
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
        });
    });


    // --- Edge Creation ---
    const allEdges: Edge[] = [];
    eventMap.forEach((nodeData, nodeName) => {
        const successors = successorsMap.get(nodeName) || [];
        successors.forEach(succName => {
            // Check if the target node exists before creating edge
            if (eventMap.has(succName)) {
                 // Determine if edge is on critical path
                const sourceNode = eventMap.get(nodeName)!;
                const targetNode = eventMap.get(succName)!;
                const isCritical = sourceNode.timeReserve === 0 &&
                                   targetNode.timeReserve === 0 &&
                                   // Check if EF(source) === ES(target) for critical path condition
                                   Math.abs(sourceNode.earlyFinish - targetNode.earlyStart) < 1e-9;

                allEdges.push({
                    id: `${nodeName}-${succName}`,
                    source: nodeName,
                    target: succName,
                    animated: isCritical, // Animate critical path edges
                    style: isCritical ? { stroke: 'red', strokeWidth: 2 } : { strokeWidth: 1 }, // Style critical path edges
                });
            } else {
                console.warn(`Target node "${succName}" for edge from "${nodeName}" not found.`);
            }
        });
    });


    return { nodes: nodeLayout, edges: allEdges };
  }, [events]); // Recalculate when events change

  return (
    <div className="w-full h-[700px] border rounded-lg bg-gray-50 dark:bg-black"> {}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{
          eventNode: EventNode, 
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        <Controls />
      </ReactFlow>
    </div>
  );
}