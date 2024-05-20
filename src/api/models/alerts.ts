export type Alert = {
  id: string;
  marketName: string;
  spread: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AlertRequest = {
  market: string;
  spread: number;
};

export type AlertResponse = {
  alert: Alert;
};

export type AlertManyResponse = {
  alerts: Alert[];
};
