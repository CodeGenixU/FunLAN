
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/axios';
import { User, Lock } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await api.post('/auth', formData);
            if (response.data.status === 'success') {
                toast.success('Login Successful!');
                // Store session info if needed, though backend handles session cookie usually.
                // If the backend returns user data, we might want to store it in context/store.
                console.log(response.data);
                navigate('/');
            } else {
                toast.error('Login Failed: ' + (response.data.message || 'Invalid credentials'));
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during login.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-xl">
                <h3 className="text-2xl font-bold text-center">Login to your account</h3>
                <form onSubmit={handleLogin}>
                    <div className="mt-4">
                        <div>
                            <label className="block" htmlFor="username">Username</label>
                            <div className="flex items-center mt-2">
                                <User className="w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block" htmlFor="password">Password</label>
                            <div className="flex items-center mt-2">
                                <Lock className="w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-baseline justify-between">
                            <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Login</button>
                            <a href="/signup" className="text-sm text-blue-600 hover:underline">Sign up?</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
