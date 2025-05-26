export interface EventInput {
    name: string;
    duration: number;
    predecessors?: string;
  }
  
  export interface EventData extends EventInput {
    earlyStart: number;
    earlyFinish: number;
    lateStart: number;
    lateFinish: number;
    timeReserve: number;
  }