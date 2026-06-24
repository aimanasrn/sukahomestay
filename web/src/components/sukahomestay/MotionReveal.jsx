import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

function buildRevealVariants(reduceMotion, distance = 28, delay = 0) {
  if (reduceMotion) {
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { duration: 0.2, delay },
      },
    };
  }

  return {
    hidden: { opacity: 0, y: distance },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };
}

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  distance = 28,
  once = true,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial="hidden"
      {...props}
      variants={buildRevealVariants(reduceMotion, distance, delay)}
      viewport={{ once, amount: 0.2 }}
      whileInView="show"
    >
      {children}
    </Tag>
  );
}

export function StaggerGroup({
  as = "div",
  children,
  className,
  once = true,
  stagger = 0.1,
  delayChildren = 0,
  ...props
}) {
  const reduceMotion = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial="hidden"
      {...props}
      variants={{
        hidden: {},
        show: {
          transition: reduceMotion
            ? { delayChildren }
            : { staggerChildren: stagger, delayChildren },
        },
      }}
      viewport={{ once, amount: 0.15 }}
      whileInView="show"
    >
      {children}
    </Tag>
  );
}

export function AnimatedPanel({
  children,
  className,
  hoverLift = true,
  delay = 0,
  ...props
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      {...props}
      variants={buildRevealVariants(reduceMotion, 22, delay)}
      viewport={{ once: true, amount: 0.18 }}
      whileInView="show"
      whileHover={
        reduceMotion || !hoverLift
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.22, ease: "easeOut" },
            }
      }
    >
      {children}
    </motion.div>
  );
}

export function FadePresence({ children, mode = "wait" }) {
  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  );
}
