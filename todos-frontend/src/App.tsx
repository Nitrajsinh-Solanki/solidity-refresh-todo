import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { getAddress } from 'viem';
import { 
    useWatchTodosTodoCreated, 
    useWatchTodosTodoDeleted, 
    useWatchTodosTodoUpdated, 
    useWriteTodosCreateTodo, 
    useWriteTodosDeleteTodo, 
    useWriteTodosUpdateTodo 
} from './generated.ts';
import { type FormEvent, useState } from 'react';
import { config } from './wagmi.ts';
import type { Address } from 'viem';

// ✅ Convert contract address to checksum format
const contractAddress: Address = getAddress("deployedContractAddress");

function CreateTodoForm() {
    useWatchTodosTodoCreated({
        config: config,
        address: contractAddress,
        onLogs(logs) {
            console.log('Event: Created a Todo', logs);
        },
    });

    const [todoTitle, setTodoTitle] = useState<string>("");
    const [todoDescription, setTodoDescription] = useState<string>("");
    const { writeContractAsync } = useWriteTodosCreateTodo({ config });

    const submitCreateTodo = async (e: FormEvent) => {
        e.preventDefault();

        await writeContractAsync({
            address: contractAddress,
            args: [todoTitle, todoDescription]
        });

        setTodoTitle("");
        setTodoDescription("");
    }

    return (
        <form onSubmit={submitCreateTodo}>
            <input type="text" value={todoTitle} placeholder="Todo Title" 
                onChange={(e) => setTodoTitle(e.target.value)} />
            <textarea rows={5} placeholder="What's on your mind?" 
                value={todoDescription} onChange={(e) => setTodoDescription(e.target.value)} />
            <button type="submit">Submit New Todo</button>
        </form>
    );
}

function DeleteTodoForm() {
    useWatchTodosTodoDeleted({
        config: config,
        address: contractAddress,
        onLogs(logs) {
            console.log('Event: Deleted a Todo', logs);
        }
    });

    const [todoId, setTodoId] = useState<number>(0);
    const { writeContractAsync } = useWriteTodosDeleteTodo({ config });

    const submitDeleteTodo = async (e: FormEvent) => {
        e.preventDefault();

        await writeContractAsync({
            address: contractAddress,
            args: [BigInt(todoId)]
        });

        setTodoId(0);
    }

    return (
        <form onSubmit={submitDeleteTodo}>
            <input type="number" value={todoId} placeholder="Todo ID" 
                onChange={(e) => setTodoId(Number.parseInt(e.target.value))} />
            <button type="submit">Delete Todo By ID</button>
        </form>
    );
}

function UpdateTodoForm() {
    useWatchTodosTodoUpdated({
        config: config,
        address: contractAddress,
        onLogs(logs) {
            console.log('Event: Updated a Todo', logs);
        },
    });

    const [todoId, setTodoId] = useState<number>(0);
    const [todoTitle, setTodoTitle] = useState<string>("");
    const [todoDescription, setTodoDescription] = useState<string>("");
    const { writeContractAsync } = useWriteTodosUpdateTodo({ config });

    const submitUpdateTodo = async (e: FormEvent) => {
        e.preventDefault();

        await writeContractAsync({
            address: contractAddress,
            args: [BigInt(todoId), todoTitle, todoDescription]
        });

        setTodoTitle("");
        setTodoDescription("");
        setTodoId(0);
    }

    return (
        <form onSubmit={submitUpdateTodo}>
            <input type="number" value={todoId} placeholder="Todo ID" 
                onChange={(e) => setTodoId(Number.parseInt(e.target.value))} />
            <input type="text" value={todoTitle} placeholder="Todo Title" 
                onChange={(e) => setTodoTitle(e.target.value)} />
            <textarea rows={5} placeholder="Update your todo here." 
                value={todoDescription} onChange={(e) => setTodoDescription(e.target.value)} />
            <button type="submit">Submit Updated Todo</button>
        </form>
    );
}

function App() {
    const account = useAccount();
    const { connectors, connect, status, error } = useConnect();
    const { disconnect } = useDisconnect();

    return (
        <>
            <div>
                <h2>Account</h2>
                <div>
                    Status: {account.status}
                    <br />
                    Addresses: {JSON.stringify(account.addresses)}
                    <br />
                    Chain ID: {account.chainId}
                </div>

                {account.status === 'connected' && (
                    <button onClick={() => disconnect()}>Disconnect</button>
                )}
            </div>

            <div>
                <h2>Connect</h2>
                {connectors.map((connector) => (
                    <button key={connector.uid} onClick={() => connect({ connector })}>
                        {connector.name}
                    </button>
                ))}
                <div>{status}</div>
                <div>{error?.message}</div>
                
                <div className="card">
                    <CreateTodoForm />
                </div>
                <div className="card">
                    <UpdateTodoForm />
                </div>
                <div className="card">
                    <DeleteTodoForm />
                </div>
            </div>
        </>
    );
}

export default App;
