import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();

        // Validación de campos vacíos
        if (!email || !password) {
            setErrorMessage('Por favor, complete todos los campos');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/register', {
                email,
                password
            });

            if (response.status === 201) {
                setSuccessMessage('Registro exitoso, redirigiendo...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            if (error.response) {
                setErrorMessage(error.response.data.message || 'Error al registrar usuario');
            } else {
                setErrorMessage('No se pudo conectar con el servidor');
            }
        }
    };

    return (
        <div className="register-container">
            <h2>Registro</h2>
            {errorMessage && <p className="error">{errorMessage}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            <form onSubmit={handleRegister}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Registrarse</button>
            </form>
        </div>
    );
}

export default Register;
