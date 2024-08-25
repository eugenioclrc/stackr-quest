import type { MRUInfo } from "./types";

const ROLLUP_URL = "http://localhost:3210";

const get = async <T>(path = ""): Promise<T> => {
    const res = await fetch(`${ROLLUP_URL}/${path}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${path}`);
    }
    return res.json();
  };
  
export async function getInfo() {
  return get<MRUInfo>("info");
};


export async function getWorld(address: string) {
  return get<MRUInfo>(`world/${address}`);
};
  
export async function getState() {
    return get<{ state: number }>();
  }
  
  /* SUBMIT ACTION */
  export async function submitAction(
    action: string,
    data: any
  ): Promise<{
    logs: { name: string; value: number }[];
    ackHash: string;
  }> {
    const res = await fetch(`${ROLLUP_URL}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    const json = await res.json();
    if ((json).error) {
      throw new Error((json).error);
    }
    return json;

  };
  