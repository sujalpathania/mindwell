import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }}
            className={`bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
        />
    );
};

export const CardSkeleton = () => (
    <div className="glass-panel p-6 space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <div className="flex space-x-2">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-8 w-1/4" />
        </div>
    </div>
);

export const ListSkeleton = () => (
    <div className="space-y-4">
        {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
        ))}
    </div>
);

export const ChartSkeleton = () => (
    <div className="glass-panel p-6 space-y-6">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-1/6" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="flex justify-around pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-12" />
            ))}
        </div>
    </div>
);

export default Skeleton;
