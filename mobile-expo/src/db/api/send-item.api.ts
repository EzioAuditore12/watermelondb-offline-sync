import { ItemEntity } from "../schema";

export async function sendItemToServer(item: ItemEntity) {
  const response = await fetch('https://api.example.com/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
}
