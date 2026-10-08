import { useEffect, useState } from "react";

function App() {

    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);

    const [token, setToken] = useState(null);
    const [services, setServices] = useState([]);

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [queueInfo, setQueueInfo] = useState("");
    const [servingToken, setServingToken] = useState(null);

    const [turnAlert, setTurnAlert] = useState("");

    const [showTransfer, setShowTransfer] = useState(false);
    const [transferServiceId, setTransferServiceId] = useState("");

    const [error, setError] = useState("");



    useEffect(() => {

        const savedUser = localStorage.getItem("user");
        const savedTokenId = localStorage.getItem("tokenId");

        if (savedUser) {

            setUser(JSON.parse(savedUser));
            setPage("dashboard");

        }

        if (savedTokenId) {

            loadToken(savedTokenId);

        }

    }, []);



    useEffect(() => {

        if (page === "dashboard" && !token) {

            fetch("https://digital-queue-management-system-apyg.onrender.com/services")

                .then(response => {

                    if (!response.ok) {
                        throw new Error("Failed to load services");
                    }

                    return response.json();

                })

                .then(data => {

                    setServices(data);

                })

                .catch(error => {

                    console.log(error);

                });

        }

    }, [page, token]);



    const loadToken = (tokenId) => {

        fetch(`https://digital-queue-management-system-apyg.onrender.com/tokens/${tokenId}`)

            .then(response => {

                if (!response.ok) {
                    throw new Error("Token not found");
                }

                return response.json();

            })

            .then(data => {

                setToken(data);

                localStorage.setItem(
                    "tokenId",
                    data.id
                );

            })

            .catch(error => {

                console.log(error);

                localStorage.removeItem("tokenId");

                setToken(null);

            });

    };



    const login = (e) => {

        e.preventDefault();

        setError("");

        fetch("https://digital-queue-management-system-apyg.onrender.com/users/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: loginEmail,
                password: loginPassword
            })

        })

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Invalid email or password"
                    );

                }

                return response.json();

            })

            .then(data => {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data)
                );

                setUser(data);

                setPage("dashboard");

                setLoginEmail("");
                setLoginPassword("");

            })

            .catch(error => {

                setError(error.message);

            });

    };



    const register = (e) => {

        e.preventDefault();

        setError("");

        fetch("https://digital-queue-management-system-apyg.onrender.com/users", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: registerName,
                email: registerEmail,
                password: registerPassword
            })

        })

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Registration failed"
                    );

                }

                return response.json();

            })

            .then(() => {

                alert(
                    "Registration successful. Please login."
                );

                setRegisterName("");
                setRegisterEmail("");
                setRegisterPassword("");

                setPage("login");

            })

            .catch(error => {

                setError(error.message);

            });

    };



    const getToken = (serviceId) => {

        if (!user) {

            alert("Please login first");

            return;

        }

        fetch(
            `https://digital-queue-management-system-apyg.onrender.com/tokens?userId=${user.id}&serviceId=${serviceId}`,
            {
                method: "POST"
            }
        )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to create token"
                    );

                }

                return response.json();

            })

            .then(data => {

                setToken(data);

                localStorage.setItem(
                    "tokenId",
                    data.id
                );

                setTurnAlert("");

                setShowTransfer(false);
                setTransferServiceId("");

                getQueuePosition(data.id);

                getServingToken(
                    data.service.id
                );

            })

            .catch(error => {

                console.log(error);

                alert(
                    "Unable to create token"
                );

            });

    };



    const getQueuePosition = (tokenId) => {

        fetch(
            `https://digital-queue-management-system-apyg.onrender.com/tokens/${tokenId}/queue`
        )

            .then(response => response.text())

            .then(data => {

                setQueueInfo(data);

            })

            .catch(error =>
                console.log(error)
            );

    };



    const getServingToken = (serviceId) => {

        fetch(
            `https://digital-queue-management-system-apyg.onrender.com/tokens/serving?serviceId=${serviceId}`
        )

            .then(response => {

                if (!response.ok) {

                    return null;

                }

                return response.json();

            })

            .then(data => {

                setServingToken(data);

            })

            .catch(error =>
                console.log(error)
            );

    };



    useEffect(() => {

        if (!token || !token.id) {

            return;

        }

        const interval = setInterval(() => {

            fetch(
                `https://digital-queue-management-system-apyg.onrender.com/tokens/${token.id}`
            )

                .then(response => {

                    if (!response.ok) {

                        throw new Error(
                            "Failed to load token"
                        );

                    }

                    return response.json();

                })

                .then(data => {

                    setToken(data);

                    localStorage.setItem(
                        "tokenId",
                        data.id
                    );



                    if (data.status === "WAITING") {

                        getQueuePosition(
                            data.id
                        );



                        fetch(
                            `https://digital-queue-management-system-apyg.onrender.com/tokens/serving?serviceId=${data.service.id}`
                        )

                            .then(response => {

                                if (!response.ok) {

                                    return null;

                                }

                                return response.json();

                            })

                            .then(serving => {

                                setServingToken(serving);



                                if (serving) {

                                    const difference =
                                        data.tokenNumber -
                                        serving.tokenNumber;



                                    if (
                                        difference === 2 &&
                                        turnAlert !== "near"
                                    ) {

                                        alert(
                                            "🔔 Your turn is approaching!\n\n" +
                                            "Your Token: " +
                                            data.tokenNumber +
                                            "\n" +
                                            "Currently Serving: " +
                                            serving.tokenNumber +
                                            "\n\n" +
                                            "Please be ready."
                                        );

                                        setTurnAlert("near");

                                    }



                                    else if (
                                        difference <= 0 &&
                                        turnAlert !== "now"
                                    ) {

                                        alert(
                                            "🟢 It's your turn now!\n\n" +
                                            "Your Token: " +
                                            data.tokenNumber +
                                            "\n\n" +
                                            "Please proceed to the counter."
                                        );

                                        setTurnAlert("now");

                                    }



                                    else if (
                                        difference > 2
                                    ) {

                                        setTurnAlert("");

                                    }

                                }

                            })

                            .catch(error =>
                                console.log(error)
                            );

                    }



                    if (data.status === "SERVING") {

                        getServingToken(
                            data.service.id
                        );

                    }

                })

                .catch(error =>
                    console.log(error)
                );

        }, 2000);



        return () =>
            clearInterval(interval);

    }, [token?.id, turnAlert]);



    const transferToken = () => {

        if (!transferServiceId) {

            alert(
                "Please select a service"
            );

            return;

        }



        fetch(
            `https://digital-queue-management-system-apyg.onrender.com/tokens/${token.id}/transfer?serviceId=${transferServiceId}`,
            {
                method: "PUT"
            }
        )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Transfer failed"
                    );

                }

                return response.json();

            })

            .then(data => {

                setToken(data);

                setTransferServiceId("");

                setShowTransfer(false);

                setQueueInfo("");

                setTurnAlert("");

                alert(
                    "✅ Token transferred successfully!"
                );

                getQueuePosition(
                    data.id
                );

                getServingToken(
                    data.service.id
                );

            })

            .catch(error => {

                console.log(error);

                alert(
                    "Unable to transfer token"
                );

            });

    };



    const logout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("tokenId");

        setUser(null);
        setToken(null);
        setQueueInfo("");
        setServingToken(null);
        setTurnAlert("");

        setShowTransfer(false);
        setTransferServiceId("");

        setPage("login");

    };



    const getNewToken = () => {

        localStorage.removeItem("tokenId");

        setToken(null);
        setQueueInfo("");
        setServingToken(null);
        setTurnAlert("");

        setShowTransfer(false);
        setTransferServiceId("");

        setPage("dashboard");

    };



    if (page === "login") {

        return (

            <div className="auth-container">

                <div className="auth-card">

                    <div className="logo">
                        🎟️ QueueEase
                    </div>

                    <div className="subtitle">
                        Digital Queue Management System
                    </div>

                    <h2>
                        Welcome Back
                    </h2>

                    <p className="form-description">
                        Login to manage your digital queue.
                    </p>

                    <form onSubmit={login}>

                        <label className="form-label">
                            Email
                        </label>

                        <input
                            className="input"
                            type="email"
                            placeholder="Enter your email"
                            value={loginEmail}
                            onChange={(e) =>
                                setLoginEmail(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <label className="form-label">
                            Password
                        </label>

                        <input
                            className="input"
                            type="password"
                            placeholder="Enter your password"
                            value={loginPassword}
                            onChange={(e) =>
                                setLoginPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                        {error && (

                            <p style={{ color: "red" }}>
                                {error}
                            </p>

                        )}

                        <button
                            className="primary-button"
                            type="submit"
                        >
                            Login
                        </button>

                    </form>

                    <div className="divider">
                        OR
                    </div>

                    <p className="account-text">
                        Don't have an account?
                    </p>

                    <button
                        className="secondary-button"
                        onClick={() => {

                            setError("");
                            setPage("register");

                        }}
                    >
                        Create Account
                    </button>

                </div>

            </div>

        );

    }



    if (page === "register") {

        return (

            <div className="auth-container">

                <div className="auth-card">

                    <div className="logo">
                        🎟️ QueueEase
                    </div>

                    <div className="subtitle">
                        Digital Queue Management System
                    </div>

                    <h2>
                        Create Account
                    </h2>

                    <p className="form-description">
                        Register to get your digital token.
                    </p>

                    <form onSubmit={register}>

                        <label className="form-label">
                            Name
                        </label>

                        <input
                            className="input"
                            type="text"
                            placeholder="Enter your name"
                            value={registerName}
                            onChange={(e) =>
                                setRegisterName(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <label className="form-label">
                            Email
                        </label>

                        <input
                            className="input"
                            type="email"
                            placeholder="Enter your email"
                            value={registerEmail}
                            onChange={(e) =>
                                setRegisterEmail(
                                    e.target.value
                                )
                            }
                            required
                        />

                        <label className="form-label">
                            Password
                        </label>

                        <input
                            className="input"
                            type="password"
                            placeholder="Create a password"
                            value={registerPassword}
                            onChange={(e) =>
                                setRegisterPassword(
                                    e.target.value
                                )
                            }
                            required
                        />

                        {error && (

                            <p style={{ color: "red" }}>
                                {error}
                            </p>

                        )}

                        <button
                            className="primary-button"
                            type="submit"
                        >
                            Register
                        </button>

                    </form>

                    <div className="divider">
                        OR
                    </div>

                    <button
                        className="secondary-button"
                        onClick={() => {

                            setError("");
                            setPage("login");

                        }}
                    >
                        Back to Login
                    </button>

                </div>

            </div>

        );

    }



    return (

        <div className="dashboard-container">

            <div className="dashboard-header">

                <div>

                    <h1>
                        Welcome, {user?.name} 👋
                    </h1>

                    <p>
                        Select a service and get your digital token.
                    </p>

                </div>

                <button
                    className="logout-button"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>



            {!token && (

                <>

                    <h2 className="section-title">
                        Select a Service
                    </h2>

                    <div className="services-grid">

                        {services.map(service => (

                            <div
                                className="service-card"
                                key={service.id}
                            >

                                <div className="service-icon">
                                    🎫
                                </div>

                                <h3>
                                    {service.name}
                                </h3>

                                <p>
                                    Average Service Time
                                </p>

                                <strong>
                                    {service.averageServiceTime} minutes
                                </strong>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        getToken(service.id)
                                    }
                                >
                                    Get Token
                                </button>

                            </div>

                        ))}

                    </div>

                </>

            )}



            {token && (

                <div className="token-card">

                    <h2>
                        Your Digital Token
                    </h2>

                    <p className="token-subtitle">
                        Keep this token number with you.
                    </p>

                    <div className="token-number">
                        {token.tokenNumber}
                    </div>



                    <div className="token-service">

                        <span>
                            Service
                        </span>

                        <strong>
                            {token.service.name}
                        </strong>

                    </div>



                    <div className="token-status">

                        <span>
                            Status
                        </span>

                        <strong>
                            {token.status === "WAITING"
                                ? "🟡 WAITING"
                                : token.status === "SERVING"
                                ? "🟢 SERVING"
                                : token.status === "COMPLETED"
                                ? "🔵 COMPLETED"
                                : token.status
                            }
                        </strong>

                    </div>



                    {token.status === "WAITING" && (

                        <>

                            <div className="queue-info">

                                <div className="queue-item">

                                    <div className="queue-icon">
                                        👥
                                    </div>

                                    <div>

                                        <span>
                                            Queue Information
                                        </span>

                                        <strong>
                                            {queueInfo
                                                ? queueInfo
                                                    .split("\n")[1]
                                                    ?.replace(
                                                        "Queue Position: ",
                                                        ""
                                                    )
                                                : "Loading..."
                                            }
                                        </strong>

                                    </div>

                                </div>



                                <div className="queue-item">

                                    <div className="queue-icon">
                                        ⏱️
                                    </div>

                                    <div>

                                        <span>
                                            Estimated Waiting Time
                                        </span>

                                        <strong>
                                            {queueInfo
                                                ? queueInfo
                                                    .split("\n")[3]
                                                    ?.replace(
                                                        "Estimated Waiting Time: ",
                                                        ""
                                                    )
                                                : "Calculating..."
                                            }
                                        </strong>

                                    </div>

                                </div>

                            </div>



                            <button
                                className="transfer-button"
                                onClick={() =>
                                    setShowTransfer(
                                        !showTransfer
                                    )
                                }
                            >
                                🔄 Transfer Service
                            </button>



                            {showTransfer && (

                                <div className="transfer-box">

                                    <h3>
                                        🔄 Transfer Your Token
                                    </h3>

                                    <p>
                                        Current Service:
                                        <strong>
                                            {" "}
                                            {token.service.name}
                                        </strong>
                                    </p>



                                    <select
                                        value={transferServiceId}
                                        onChange={(e) =>
                                            setTransferServiceId(
                                                e.target.value
                                            )
                                        }
                                    >

                                        <option value="">
                                            Select New Service
                                        </option>



                                        {services
                                            .filter(
                                                service =>
                                                    service.id !==
                                                    token.service.id
                                            )
                                            .map(service => (

                                                <option
                                                    key={service.id}
                                                    value={service.id}
                                                >
                                                    {service.name}
                                                </option>

                                            ))
                                        }

                                    </select>



                                    <button
                                        className="confirm-transfer-button"
                                        onClick={transferToken}
                                    >
                                        Confirm Transfer
                                    </button>

                                </div>

                            )}

                        </>

                    )}



                    {token.status === "SERVING" && (

                        <div className="status-message serving-message">

                            🔔 Your token is being served now!

                        </div>

                    )}



                    {token.status === "COMPLETED" && (

                        <>

                            <div className="status-message completed-message">

                                ✅ Your service has been completed!

                            </div>

                            <button
                                className="primary-button"
                                onClick={getNewToken}
                                style={{
                                    marginTop: "20px"
                                }}
                            >
                                🎟️ Get New Token
                            </button>

                        </>

                    )}



                    {servingToken &&
                        token.status === "WAITING" && (

                            <div className="serving-box">

                                <span>
                                    Currently Serving
                                </span>

                                <strong>
                                    Token {servingToken.tokenNumber}
                                </strong>

                            </div>

                        )}



                    {turnAlert === "near" && (

                        <div className="turn-message near-message">

                            🔔 Your turn is approaching!
                            <br />
                            Please be ready.

                        </div>

                    )}



                    {turnAlert === "now" && (

                        <div className="turn-message now-message">

                            🟢 It's your turn now!
                            <br />
                            Please proceed to the counter.

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}

export default App;