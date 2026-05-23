// components/common/LoadingSpinner.jsx
import { motion } from 'framer-motion';

export default function LoadingSpinner() {
    return (
        <div className="loading-spinner">
            <motion.div
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}