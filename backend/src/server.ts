import express, { Request, Response } from 'express';
import * as yaml from 'js-yaml';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());


//index 1 
let forwardIndex_TicketsToServices: Map<string, string[]> = new Map();

//index 2
let invertedIndex_ServicesToTickets: Map<string, string[]> = new Map();

//system structure
interface SystemStructure {
    tickets: {
        [ticketId: string]: {
            services: string[];
        }
    }
}

//endpoint1 -- to build index
app.post('/api/structure', (req: Request, res: Response) => {
    try {
        const systemStructure: SystemStructure = yaml.load(req.body.yaml) as SystemStructure;
        
        // Clear previous
        forwardIndex_TicketsToServices.clear();
        invertedIndex_ServicesToTickets.clear();

        // Build new indexes
        for (const ticketId in systemStructure.tickets) {
            const ticket = systemStructure.tickets[ticketId];
            
            //forward index
            forwardIndex_TicketsToServices.set(ticketId, ticket.services);

            //inverted index
            for (const service of ticket.services) {
                if (!invertedIndex_ServicesToTickets.has(service)) {
                    invertedIndex_ServicesToTickets.set(service, []);
                }
                invertedIndex_ServicesToTickets.get(service)!.push(ticketId);
            }
        }
        
        res.status(200).send({ message: 'System structure and indexes built successfully.' });

    } catch (error) {
        res.status(400).send({ message: 'Invalid YAML format.', error: (error as Error).message });
    }
});


//endpoint2 -- to remove ticket
app.post('/api/remove-ticket', (req: Request, res: Response) => {
    const { ticketIdToRemove } = req.body;

    if (!forwardIndex_TicketsToServices.has(ticketIdToRemove)) {
        return res.status(404).send({ message: 'Ticket to remove not found in the system structure.' });
    }

    //Algorithm

    //final output
    const affectedTickets = new Set<string>();

    //current stack
    const processingStack: string[] = [ticketIdToRemove];

    //skip visited
    const visited = new Set<string>([ticketIdToRemove]);

    //save reasons
    const reasons: { [ticketId: string]: string } = {};
    
    while (processingStack.length > 0) {

        const currentTicket = processingStack.pop()!;

        // 1. find services affected by the current ticket.
        const servicesImpacted = forwardIndex_TicketsToServices.get(currentTicket) || [];

        for (const service of servicesImpacted) {
            // 2. find tickets affected by each service
            const relatedTickets = invertedIndex_ServicesToTickets.get(service) || [];

            for (const relatedTicket of relatedTickets) {
                if (!visited.has(relatedTicket)) {

                    visited.add(relatedTicket);

                    affectedTickets.add(relatedTicket);

                    reasons[relatedTicket] = `Affected due to shared dependency on service '${service}', which is impacted by the removal chain.`;
                    
                    processingStack.push(relatedTicket);
                }
            }
        }
    }

    res.status(200).send({
        removedTicket: ticketIdToRemove,
        affectedTickets: Array.from(affectedTickets),
        reasons: reasons,
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});