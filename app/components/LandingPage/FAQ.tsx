import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMail } from 'react-icons/fi';

function FAQ({openFaq,setOpenFaq}:any) {
  return (
    <section className="py-24 bg-gray-50 text-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-yellow-500">Questions</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Edutube
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "Is Edutube really completely free?",
                answer: "Yes! Edutube is 100% free forever. There are no hidden costs, no premium tiers, no subscriptions. We believe education should be accessible to everyone, everywhere. All features including progress tracking, course creation, and sharing are completely free."
              },
              {
                question: "How do I convert YouTube playlists to courses?",
                answer: "It's simple! Just create a new course, add your YouTube video URLs one by one, and our platform will automatically organize them into a structured learning path. You can add descriptions, set completion tracking, and even make them public for others to learn from."
              },
              {
                question: "Can I track my learning progress?",
                answer: "Absolutely! Edutube includes advanced progress tracking features like completion percentages, daily learning streaks, time spent learning, and detailed analytics. You can see exactly how you're progressing through each course and maintain learning momentum."
              },
              {
                question: "Can I share my courses publicly?",
                answer: "Yes! You can make your courses public so anyone can discover and learn from them. You can also keep them private for your personal use. Public courses help build our learning community and let you share your expertise with others."
              },
              {
                question: "Do I need to create content from scratch?",
                answer: "Not at all! That's the beauty of Edutube. You can use existing YouTube videos to create structured courses. Just organize videos into lessons, add descriptions, and you have a professional course. You can also create original content if you want."
              },
              {
                question: "How is this different from just watching YouTube?",
                answer: "While YouTube is great for individual videos, Edutube transforms scattered content into structured learning experiences. You get progress tracking, organized curriculum, completion certificates, daily streaks, and a focused learning environment without distractions."
              },
              {
                question: "Is my data secure?",
                answer: "Yes! We use industry-standard security measures to protect your data. Your personal information, learning progress, and courses are securely stored and never shared with third parties. You own your data and can export or delete it anytime."
              },
              {
                question: "Can I use Edutube on mobile devices?",
                answer: "Absolutely! Edutube is fully responsive and works perfectly on smartphones, tablets, and desktops. You can continue your learning journey anywhere, anytime. Your progress syncs across all devices automatically."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <button
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Still have questions? */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="bg-black rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4 text-orange-400">Still have questions?</h3>
              <p className="text-gray-300 mb-6">
                We're here to help! Contact us directly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.a
                  href="mailto:hacktf.academy@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-black font-bold rounded-full hover:bg-orange-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMail className="w-4 h-4 mr-2" />
                  Contact Support
                </motion.a>
           
              </div>
            </div>
          </motion.div>
        </div>
      </section>
  )
}

export default FAQ