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
        
        // Pozycje i węzły dla każdego zdarzenia
        const eventNodes: Node[] = events.map((event) => {
          const level = levelMap.get(event.name) || 0;
          const nodesInThisLevel = nodesPerLevel.get(level) || 1;
          
          // Inicjalizujemy licznik pozycji dla tego poziomu
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
        
        // Węzeł końcowy
        const endNode: Node = {
          id: 'end',
          type: 'eventNode',
          position: { 
            x: 100 + (maxLevel + 1) * 150, 
            y: 100 + (maxLevel + 1) * 150
          },
          data: { name: 'KONIEC', duration: 0, earlyStart: totalDuration, earlyFinish: totalDuration, lateStart: totalDuration, lateFinish: totalDuration, timeReserve: 0 }
        };
        
        // Łączymy węzły
        const allNodes = [startNode, ...eventNodes, endNode];
        
        // Krawędzie na podstawie poprzedników
        const allEdges: Edge[] = [];
        
        // Śledzimy, które węzły są poprzednikami innych
        const hasDependents = new Set<string>();
        
        // Łączenie krawędzi z poprzednikami
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
        
        // Łączenie z "start" i "end"
        events.forEach(event => {
          if (!event.predecessors || event.predecessors.trim() === '') {
            allEdges.push({
              id: `start-${event.name}`,
              source: 'start',
              target: event.name,
            });
          }
        });
        
        events.forEach(event => {
          if (!hasDependents.has(event.name)) {
            allEdges.push({
              id: `${event.name}-end`,
              source: event.name,
              target: 'end',
            });
          }
        });

        // Teraz obliczymy czasy (EarlyStart, EarlyFinish, LateStart, LateFinish, TimeReserve)
        const earlyStartMap = new Map<string, number>();
        const earlyFinishMap = new Map<string, number>();
        const lateStartMap = new Map<string, number>();
        const lateFinishMap = new Map<string, number>();

        // 1. Obliczamy Early Start i Early Finish
        events.forEach(event => {
          const predecessorsList = predecessorsMap.get(event.name) || [];
          const earliestFinish = predecessorsList.length > 0
            ? Math.max(...predecessorsList.map(pred => earlyFinishMap.get(pred) || 0))
            : 0;

          earlyStartMap.set(event.name, earliestFinish);
          earlyFinishMap.set(event.name, earliestFinish + event.duration);
        });

        // 2. Obliczamy Late Start i Late Finish
        lateFinishMap.set('end', earlyFinishMap.get('end') || totalDuration);
        lateStartMap.set('end', lateFinishMap.get('end') - 0);  // "duration" end node to 0
        
        events.reverse().forEach(event => {
          const successors = events.filter(e => e.predecessors?.includes(event.name));
          const latestStart = successors.length > 0
            ? Math.min(...successors.map(succ => lateStartMap.get(succ.name) || Infinity))
            : totalDuration;

          lateFinishMap.set(event.name, latestStart);
          lateStartMap.set(event.name, latestStart - event.duration);
        });

        // 3. Obliczamy rezerwę czasową
        const eventNodesWithTimes: Node[] = eventNodes.map(event => {
          const earlyStart = earlyStartMap.get(event.id) || 0;
          const earlyFinish = earlyFinishMap.get(event.id) || 0;
          const lateStart = lateStartMap.get(event.id) || 0;
          const lateFinish = lateFinishMap.get(event.id) || 0;
          const timeReserve = lateStart - earlyStart;

          return {
            ...event,
            data: {
              ...event.data,
              earlyStart,
              earlyFinish,
              lateStart,
              lateFinish,
              timeReserve
            }
          };
        });

        const allNodesWithTimes = [startNode, ...eventNodesWithTimes, endNode];

        return { nodes: allNodesWithTimes, edges: allEdges };
      }, [events, totalDuration]);

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

