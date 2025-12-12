import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // --------------------------------------------------------------------------------
    // FORM HANDLING
    // --------------------------------------------------------------------------------
    // This function runs when the user clicks "Sign In".
    const handleSubmit = async (e) => {
        // 1. Prevent Default: Stops the page from refreshing (default HTML form behavior).
        e.preventDefault();

        setError('');
        setIsLoading(true);

        // 2. Auth Context: calling the login function from our custom hook.
        // It talks to the backend, gets the JWT token, and saves it.
        const res = await login(email, password);

        setIsLoading(false);
        if (res.success) {
            // 3. Navigation: If successful, redirect to Dashboard ('/')
            navigate('/');
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background overflow-hidden relative transition-colors duration-500">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10 p-6 md:p-12">

                {/* Left Side: Hero/Branding */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="hidden md:flex flex-col justify-center space-y-8"
                >
                    <div className="space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
                        >
                            Focus on<br />
                            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">what matters.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-xl text-muted-foreground max-w-lg"
                        >
                            Organize your tasks, get AI-powered insights, and boost your productivity with our premium to-do experience.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="space-y-4"
                    >
                        {[
                            "Smart AI Summaries",
                            "Beautiful Dark Mode",
                            "Seamless Organization"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-medium">{feature}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Right Side: Login Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col justify-center items-center"
                >
                    <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 lg:p-10 relative overflow-hidden transition-all hover:shadow-primary/5 hover:border-primary/20">
                        {/* Decorative top shimmer */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                            <p className="text-muted-foreground">Enter your credentials to access your workspace</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center mb-6"
                            >
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 bg-background/50 border-input/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Password</label>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 bg-background/50 border-input/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
                                />
                                <div className="flex justify-end">
                                    <Link to="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:underline transition-all">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
