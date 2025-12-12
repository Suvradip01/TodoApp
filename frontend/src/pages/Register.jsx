import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    // --------------------------------------------------------------------------------
    // REGISTER LOGIC
    // --------------------------------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault(); // Stop page reload
        setError('');
        setIsLoading(true);

        // Call the register function from AuthContext
        // This creates a NEW user in the MongoDB database
        const res = await register(username, email, password);

        setIsLoading(false);
        if (res.success) {
            navigate('/'); // Redirect to Dashboard on success
        } else {
            setError(res.message); // Show error message (e.g., "Email already exists")
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-background overflow-hidden relative transition-colors duration-500">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px]" />
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
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit"
                        >
                            <Sparkles className="h-4 w-4" /> Join the future of productivity
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
                        >
                            Start your <br />
                            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">journey today.</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-xl text-muted-foreground max-w-lg"
                        >
                            Create an account to sync your tasks across devices and unlock powerful AI features.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="space-y-4"
                    >
                        {[
                            "Free forever for individuals",
                            "Secure and encrypted",
                            "Available on all devices"
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <span className="text-lg font-medium">{feature}</span>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Right Side: Register Form */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col justify-center items-center"
                >
                    <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 shadow-2xl rounded-3xl p-8 lg:p-10 relative overflow-hidden transition-all hover:shadow-purple-500/5 hover:border-purple-500/20">
                        {/* Decorative top shimmer */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                            <p className="text-muted-foreground">Join thousands of productive users</p>
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
                                <label className="text-sm font-medium ml-1">Username</label>
                                <Input
                                    type="text"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="h-12 bg-background/50 border-input/50 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 bg-background/50 border-input/50 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl transition-all"
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
                                    className="h-12 bg-background/50 border-input/50 focus:border-purple-500/50 focus:ring-purple-500/20 rounded-xl transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 bg-purple-600 hover:bg-purple-700 transition-all duration-300"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
                                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </form>

                        <div className="mt-8 text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-purple-500 font-semibold hover:underline transition-all">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
