import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { connectSocket } = useSocket();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const response = await api.post('/api/auth', formData);
            if (response.data.status === 'success') {
                toast.success('Login Successful!');
                localStorage.setItem('username', response.data.data.username);
                localStorage.setItem('user_id', response.data.data.user_id);
                connectSocket(); // Manually initiate socket connection; AuthRoute will handle redirect once connected
            } else {
                toast.error('Login Failed: ' + (response.data.message || 'Invalid credentials'));
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during login.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="w-full glass-card border-white/10">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center">
                        Enter your credentials to access the fun
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="username">Username</label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password">Password</label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit">
                            Sign In
                        </Button>
                        <p className="text-sm text-center text-foreground/60">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </motion.div >
    );
};

export default Login;
