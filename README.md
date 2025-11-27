# 🎲Ticket-tac-toe Dependency Analyzer

This tool models dependency chains between Tickets and Services. It identifies the cascade effect of removing a specific ticket.

### Algorithm 

The system parses YAML input into two indexes to enable O(1) lookups:

1.  **Forward Index:** `Ticket` to `[Services]`
2.  **Inverted Index:** `Service` to `[Tickets]`

**Traversal Steps:**
1.  **Input:** Receives `Ticket ID`.
2.  **Forward Lookup:** Retrieves impacted services via **Forward Index**.
3.  **Reverse Lookup:** Retrieves dependent tickets via **Inverted Index**.
4.  **Recursion:** Processes new tickets until the dependency chain ends.

### Complexity

Let N be the number of Tickets.

*   **Standard DFS**
    *   For every ticket affected - scan all other tickets to find shared services.
    *   **Calculation:** N (tickets visited) times N (scan all tickets).
    *   **Time Complexity:** **O(N<sup>2</sup>)** (Quadratic).

*   **Indexed DFS (Implemented)**
    *   For every ticket affected - instant index lookup to find neighbors.
    *   **Calculation:** N (tickets visited) x 1 (lookup cost).
    *   **Time Complexity:** **O(N)** (Linear).

### Setup and Execution

**1. Clone Repository**
```bash
git clone <repository-url>
cd ticket-dependency-analyzer-v2
```

**2. Start Backend**
```bash
cd backend
npm install
npm start
```
*Server listens on `http://localhost:3000`.*

**3. Launch Frontend**
*   Navigate to `frontend/`.
*   Open `index.html` in a web browser.

### Sample Input

```yaml
tickets:
  TICKET-101:
    services:
      - auth-service
      - user-profile-service
  TICKET-102:
    services:
      - user-profile-service
      - payment-service
  TICKET-103:
    services:
      - order-service
  TICKET-104:
    services:
      - payment-service
      - notification-service
  TICKET-105:
    services:
      - notification-service
```