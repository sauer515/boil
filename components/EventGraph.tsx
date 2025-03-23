import React from "react";
import ReactFlow, { Node, Edge, Controls } from "reactflow";
import "reactflow/dist/style.css";
import EventNode from "./EventNode";
import { useMemo } from "react";

interface EventGraphProps {
  events: {
    name: string;
    duration: number;
    predecessors?: string;
    earlyStart?: number;
    earlyFinish?: number;
    lateStart?: number;
    lateFinish?: number;
    timeReserve?: number;
  }[];
}

export default function EventGraph({ events }: EventGraphProps) {
    const totalDuration = useMemo(() => {
        return events.reduce((sum, event) => sum + event.duration, 0);
    }, [events]);

    const { nodes, edges } = useMemo(() => {
        // Tworzymy węzły start i koniec
        const startNode: Node = {
          id: 'start',
          type: 'eventNode',
          position: { x: 50, y: 250 },
          data: { name: 'START', duration: 0, earlyStart: 0, earlyFinish: 0, lateStart: 0, lateFinish: 0, timeReserve: 0 }
        };
        
        const levelMap = new Map<string, number>();
        const predecessorsMap = new Map<string, string[]>();
        
        // Inicjalizacja map
        events.forEach(event => {
          const predecessorsList = event.predecessors 
            ? event.predecessors.trim().split(',').map(p => p.trim()).filter(p => p !== '')
            : [];
            
          predecessorsMap.set(event.name, predecessorsList);
          
          if (predecessorsList.length === 0) {
            // Węzły bez poprzedników są na poziomie 1 (poziom 0 to START)
            levelMap.set(event.name, 1);
          }
        });
        
        // Ustalamy poziomy dla pozostałych węzłów
        let changed = true;
        while (changed) {
          changed = false;
          events.forEach(event => {
            if (levelMap.has(event.name)) return;
            
            const predecessorsList = predecessorsMap.get(event.name) || [];
            // Sprawdzamy czy wszystkie poprzedniki mają już przypisany poziom
            if (predecessorsList.every(pred => levelMap.has(pred))) {
              // Poziom węzła to maksymalny poziom poprzedników + 1
              const maxPredLevel = Math.max(0, ...predecessorsList.map(pred => levelMap.get(pred) || 0));
              levelMap.set(event.name, maxPredLevel + 1);
              changed = true;
            }
          });
        }
        
        // Znajdujemy maksymalny poziom dla węzłów
        const maxLevel = Math.max(...Array.from(levelMap.values()), 1);
        levelMap.set('end', maxLevel + 1);
        
        // Liczymy ile węzłów jest na każdym poziomie
        const nodesPerLevel = new Map<number, number>();
        for (const level of levelMap.values()) {
          nodesPerLevel.set(level, (nodesPerLevel.get(level) || 0) + 1);
        }
        
        // Śledzimy aktualną pozycję dla każdego poziomu
        const currentPositionInLevel = new Map<number, number>();
        
        // Aktualizujemy pozycję węzła start
        startNode.position.y = 100 + 150 * (nodesPerLevel.get(0) || 1) / 2;
        
        // Tworzymy węzły dla każdego zdarzenia z uwzględnieniem poziomu
        const eventNodes: Node[] = events.map((event) => {
          const level = levelMap.get(event.name) || 0;
          const nodesInThisLevel = nodesPerLevel.get(level) || 1;
          
          // Inicjalizujemy licznik pozycji dla tego poziomu jeśli potrzeba
          if (!currentPositionInLevel.has(level)) {
            currentPositionInLevel.set(level, 0);
          }
          
          const positionInLevel = currentPositionInLevel.get(level) || 0;
          currentPositionInLevel.set(level, positionInLevel + 1);
          
          // Rozmieszczamy węzły równomiernie w poziomie
          const xSpacing = 700 / (nodesInThisLevel + 1);
          const x = 100 + level * 150;
          const y = xSpacing * (positionInLevel + 1);
          
          return {
            id: event.name,
            type: 'eventNode',
            position: { x, y },
            data: { ...event }
          };
        });
        
        // Aktualizujemy węzeł końcowy
        const endNode: Node = {
          id: 'end',
          type: 'eventNode',
          position: { 
            x: 100 + (maxLevel + 1) * 150, 
            y: 100 + (maxLevel + 1) * 150
          },
          data: { name: 'KONIEC', duration: 0, earlyStart: totalDuration, earlyFinish: totalDuration, lateStart: totalDuration, lateFinish: totalDuration, timeReserve: 0 }
        };
        
        // Łączymy wszystkie węzły
        const allNodes = [startNode, ...eventNodes, endNode];
        
        // Tworzymy krawędzie na podstawie poprzedników
        const allEdges: Edge[] = [];
        
        // Śledzenie, które węzły są poprzednikami innych
        const hasDependents = new Set<string>();
        
        // Tworzymy krawędzie na podstawie zdefiniowanych poprzedników
        events.forEach(event => {
          if (event.predecessors && event.predecessors.trim() !== '') {
            const predecessorsList = event.predecessors.split(',').map(p => p.trim());
            predecessorsList.forEach(predecessor => {
              allEdges.push({
                id: `${predecessor}-${event.name}`,
                source: predecessor,
                target: event.name,
              });
              hasDependents.add(predecessor);
            });
          }
        });
        
        // Łączymy węzły bez poprzedników ze startem
        events.forEach(event => {
          if (!event.predecessors || event.predecessors.trim() === '') {
            allEdges.push({
              id: `start-${event.name}`,
              source: 'start',
              target: event.name,
            });
          }
        });
        
        // Łączymy węzły bez zależnych z końcem
        events.forEach(event => {
          if (!hasDependents.has(event.name)) {
            allEdges.push({
              id: `${event.name}-end`,
              source: event.name,
              target: 'end',
            });
          }
        });
        
        return { nodes: allNodes, edges: allEdges };
      }, [events]);

  return (
    <div className="w-full h-[500px] border rounded-lg bg-white">
      <ReactFlow 
        nodes={nodes} 
        edges={edges}
        nodeTypes={{
            eventNode: EventNode,
        }}>
        <Controls />
      </ReactFlow>
    </div>
  );
}
