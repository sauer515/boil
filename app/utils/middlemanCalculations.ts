export type TransportData = {
  suppliers: number;
  recipients: number;
  costs: number[][];
  supply: number[];
  demand: number[];
  purchasePrices: number[];
  sellingPrices: number[];
};

export type Solution = {
  allocation: number[][];
  totalProfit: number;
  profits: number[][];
};

// selling price - purchase price - transport cost
export const calculateProfits = (data: TransportData): number[][] => {
  return data.costs.map((row, i) =>
    row.map((cost, j) => data.sellingPrices[j] - data.purchasePrices[i] - cost)
  );
};

export const getInitialSolution = (data: TransportData): number[][] => {
  const allocation = Array.from({ length: data.suppliers }, () => Array(data.recipients).fill(0));
  const remainingSupply = [...data.supply];
  const remainingDemand = [...data.demand];
  const profits = calculateProfits(data);

  while (remainingSupply.some(s => s > 0) && remainingDemand.some(d => d > 0)) {
    let maxProfit = -Infinity;
    let bestI = -1, bestJ = -1;

    for (let i = 0; i < data.suppliers; i++) {
      if (remainingSupply[i] <= 0) continue;
      for (let j = 0; j < data.recipients; j++) {
        if (remainingDemand[j] <= 0) continue;
        if (profits[i][j] > maxProfit) {
          maxProfit = profits[i][j];
          bestI = i;
          bestJ = j;
        }
      }
    }

    if (bestI === -1 || bestJ === -1 || maxProfit <= 0) break;

    // track maximum ??? ig
    const quantity = Math.min(remainingSupply[bestI], remainingDemand[bestJ]);
    allocation[bestI][bestJ] = quantity;
    remainingSupply[bestI] -= quantity;
    remainingDemand[bestJ] -= quantity;
  }

  return allocation;
};

export const optimizeSolution = (data: TransportData, initialAllocation: number[][]): Solution => {
  let allocation = initialAllocation.map(row => [...row]);
  let improved = true;
  let iterations = 0;
  const maxIterations = 100;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    // zero extermination
    const basicVars: Array<[number, number]> = [];
    for (let i = 0; i < data.suppliers; i++) {
      for (let j = 0; j < data.recipients; j++) {
        if (allocation[i][j] > 0) {
          basicVars.push([i, j]);
        }
      }
    }

    const ui = Array(data.suppliers).fill(undefined);
    const vj = Array(data.recipients).fill(undefined);
    const profits = calculateProfits(data);

    // u0 = 0 and calculate other values
    ui[0] = 0;
    let calculated = true;

    while (calculated) {
      calculated = false;
      for (const [i, j] of basicVars) {
        if (ui[i] !== undefined && vj[j] === undefined) {
          vj[j] = profits[i][j] - ui[i];
          calculated = true;
        } else if (ui[i] === undefined && vj[j] !== undefined) {
          ui[i] = profits[i][j] - vj[j];
          calculated = true;
        }
      }
    }

    // calculate opportunity costs for non-basic variabes
    let maxOpportunityCost = 0;
    let enteringCell: [number, number] = [-1, -1];

    for (let i = 0; i < data.suppliers; i++) {
      for (let j = 0; j < data.recipients; j++) {
        if (allocation[i][j] === 0 && ui[i] !== undefined && vj[j] !== undefined) {
          const opportunityCost = profits[i][j] - ui[i] - vj[j];
          if (opportunityCost > maxOpportunityCost) {
            maxOpportunityCost = opportunityCost;
            enteringCell = [i, j];
          }
        }
      }
    }

    // when PROGRESSS
    if (maxOpportunityCost > 0 && enteringCell[0] !== -1) {
      improved = true;
      const [ei, ej] = enteringCell;
      
      let minShift = Infinity;
      for (let i = 0; i < data.suppliers; i++) {
        if (allocation[i][ej] > 0 && i !== ei) {
          minShift = Math.min(minShift, allocation[i][ej]);
        }
      }
      for (let j = 0; j < data.recipients; j++) {
        if (allocation[ei][j] > 0 && j !== ej) {
          minShift = Math.min(minShift, allocation[ei][j]);
        }
      }

      if (minShift !== Infinity && minShift > 0) {
        allocation[ei][ej] += minShift;
        
        // reduce from other cells to maintain supply/demand constraints
        for (let i = 0; i < data.suppliers; i++) {
          if (allocation[i][ej] > 0 && i !== ei) {
            allocation[i][ej] = Math.max(0, allocation[i][ej] - minShift);
            break;
          }
        }
      }
    }
  }

  // Calculate total profit
  const profits = calculateProfits(data);
  let totalProfit = 0;
  for (let i = 0; i < data.suppliers; i++) {
    for (let j = 0; j < data.recipients; j++) {
      totalProfit += allocation[i][j] * profits[i][j];
    }
  }

  return { allocation, totalProfit, profits };
};

export const balanceTransportProblem = (data: TransportData): TransportData => {
  const totalSupply = data.supply.reduce((sum, s) => sum + s, 0);
  const totalDemand = data.demand.reduce((sum, d) => sum + d, 0);

  if (totalSupply === totalDemand) {
    return data;
  }

  const balancedData = { ...data };

  if (totalSupply > totalDemand) {
    const shortage = totalSupply - totalDemand;
    balancedData.recipients += 1;
    balancedData.demand = [...data.demand, shortage];
    balancedData.sellingPrices = [...data.sellingPrices, 0]; // No revenue from fictional recipient
    
    balancedData.costs = data.costs.map(row => [...row, 0]);
  } else {
    // Add fictional supplier
    const shortage = totalDemand - totalSupply;
    balancedData.suppliers += 1;
    balancedData.supply = [...data.supply, shortage];
    balancedData.purchasePrices = [...data.purchasePrices, 0]; // No cost from fictional supplier
    
    // Add zero transport costs from fictional supplier
    balancedData.costs = [...data.costs, Array(data.recipients).fill(0)];
  }

  return balancedData;
};

export const solveMiddlemanProblem = (data: TransportData): Solution => {
  const balancedData = balanceTransportProblem(data);
  const initialAllocation = getInitialSolution(balancedData);
  return optimizeSolution(balancedData, initialAllocation);
};