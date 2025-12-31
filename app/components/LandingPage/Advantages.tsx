import React from 'react'
import { FiBarChart, FiCheckCircle, FiDollarSign, FiFolder, FiShare2, FiSmartphone, FiUnlock, FiUsers, FiX, FiYoutube, FiZap } from 'react-icons/fi'
import {motion} from "framer-motion";

function Advantages() {
  return (
    <div>  <section className="py-24 bg-white text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Why <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-yellow-500">Edutube</span> is Special?
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We're not just another learning platform. We're revolutionizing education by making premium features completely free.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Reason 1 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiDollarSign className="w-12 h-12 text-orange-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <FiX className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">No Hidden Costs</h3>
              <p className="text-gray-600">
                Unlike other platforms that charge $50-200/month, everything on Edutube is completely free. No premium tiers, no subscriptions.
              </p>
            </motion.div>

            {/* Reason 2 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiBarChart className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Track Your Progress</h3>
              <p className="text-gray-600">
                Watch your learning journey unfold with detailed progress tracking, completion rates, and visual milestones.
              </p>
            </motion.div>

            {/* Reason 3 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiZap className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Daily Learning Streaks</h3>
              <p className="text-gray-600">
                Build consistent learning habits with streak tracking and daily goals that keep you motivated.
              </p>
            </motion.div>

            {/* Reason 4 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiUnlock className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Open Source</h3>
              <p className="text-gray-600">
                Built with the belief that education should be accessible to everyone. No artificial barriers or paywalls.
              </p>
            </motion.div>

            {/* Reason 5 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiShare2 className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Share Courses Publicly</h3>
              <p className="text-gray-600">
                Create courses and share them with the world. Build your reputation as an educator in your field.
              </p>
            </motion.div>

            {/* Reason 6 */}
            <motion.div 
              className="text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 mx-auto bg-black rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FiFolder className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4">Your Personal Course Hub</h3>
              <p className="text-gray-600">
                Organize all your learning in one place. Create, manage, and track courses in your personal dashboard.
              </p>
            </motion.div>
          </div>

          {/* Comparison Table */}
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="bg-black rounded-3xl p-8 text-white">
              <h3 className="text-3xl font-bold text-center mb-8 text-orange-400">Edutube vs Others</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="text-xl font-bold mb-4 text-red-400">Other Platforms</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center justify-center space-x-2">
                      <FiX className="w-4 h-4 text-red-400" />
                      <span>$50-200/month</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <FiX className="w-4 h-4 text-red-400" />
                      <span>Limited free features</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <FiX className="w-4 h-4 text-red-400" />
                      <span>Complex pricing tiers</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <FiX className="w-4 h-4 text-red-400" />
                      <span>Content creation required</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-center">
                  <div className="w-px h-32 bg-gray-600 hidden md:block"></div>
                  <div className="text-6xl text-orange-400 mx-4">VS</div>
                  <div className="w-px h-32 bg-gray-600 hidden md:block"></div>
                </div>

                <div>
                  <h4 className="text-xl font-bold mb-4 text-orange-400">Edutube</h4>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center justify-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-green-400" />
                      <span>100% Free Forever</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-green-400" />
                      <span>All premium features</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-green-400" />
                      <span>No hidden costs</span>
                    </li>
                    <li className="flex items-center justify-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-green-400" />
                      <span>Use YouTube playlists</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section></div>
  )
}

export default Advantages