import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import './ComingSoon.scss';

export default function ComingSoon() {
  return (
    <motion.section
      className="comingsoon"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35 }}
    >
      <h1>Coming Soon</h1>
      <p>To sign up for news and announcements join our mailing list.
Have questions? Contact us at contact@claimrunner.ai</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </motion.section>
  );
}
