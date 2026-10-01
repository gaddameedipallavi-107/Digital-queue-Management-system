import { useEffect, useState } from "react";
import "./Admin.css";

function Admin() {

    const [tokens, setTokens] = useState([]);
    const [serviceId, setServiceId] = useState(1);

    const loadTokens = () => {
        fetch("http://localhost:8081/tokens")
            .then(response => response.json())
            .then(data => setTokens(data))
            .catch(error => console.log(error));
    };

    useEffect(() => {
        loadTokens();
    }, []);

    const callNext = () => {
        fetch(
            `http://localhost:8081/tokens/next?serviceId=${serviceId}`,
            {
                method: "PUT"
            }
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error("No waiting tokens");
                }

                return response.json();
            })
            .then(() => {
                loadTokens();
                alert("Next token is now being served");
            })
            .catch(error => {
                console.log(error);
                alert("No waiting tokens for this service");
            });
    };

    const completeToken = (id) => {
        fetch(
            `http://localhost:8081/tokens/${id}/complete`,
            {
                method: "PUT"
            }
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to complete token");
                }

                return response.json();
            })
            .then(() => {
                loadTokens();
            })
            .catch(error => console.log(error));
    };

    const filteredTokens = tokens.filter(
        token => token.service.id === Number(serviceId)
    );

    const serviceName =
        serviceId === "1"
            ? "Fee Payment"
            : serviceId === "2"
            ? "Certificate Request"
            : serviceId === "3"
            ? "ID Card"
            : serviceId === "4"
            ? "Library"
            : serviceId === "5"
            ? "Scholarship"
            : "Examination";

    return (
        <div className="admin-container">

            <div className="admin-header">
                <h1>🎛️ QueueEase Admin</h1>
                <p>Queue Management Dashboard</p>
            </div>

            <div className="admin-controls">

                <label>Select Service</label>

                <select
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                >
                    <option value="1">Fee Payment</option>
                    <option value="2">Certificate Request</option>
                    <option value="3">ID Card</option>
                    <option value="4">Library</option>
                    <option value="5">Scholarship</option>
                    <option value="6">Examination</option>
                </select>

                <button
                    className="next-button"
                    onClick={callNext}
                >
                    📢 Call Next Token
                </button>

            </div>

            <div className="token-list">

                <h2>{serviceName} Tokens</h2>

                {filteredTokens.length === 0 && (
                    <p className="no-tokens">
                        No tokens available for this service.
                    </p>
                )}

                {filteredTokens.map(token => (

                    <div
                        className="admin-token-card"
                        key={token.id}
                    >

                        <div className="admin-token-number">

                            <span>Token</span>

                            <strong>
                                {token.tokenNumber}
                            </strong>

                        </div>

                        <div className="admin-token-info">

                            <p>
                                <strong>User:</strong>{" "}
                                {token.user.name}
                            </p>

                            <p>
                                <strong>Service:</strong>{" "}
                                {token.service.name}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}

                                <span
                                    className={
                                        token.status.toLowerCase()
                                    }
                                >
                                    {token.status}
                                </span>

                            </p>

                        </div>

                        <div className="admin-actions">

                            {token.status === "SERVING" && (

                                <button
                                    className="complete-button"
                                    onClick={() =>
                                        completeToken(token.id)
                                    }
                                >
                                    ✅ Complete
                                </button>

                            )}

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}

export default Admin;