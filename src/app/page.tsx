import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-6 md:py-12 lg:py-16 xl:py-24 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary-light/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex flex-col space-y-4 text-center lg:text-left lg:w-1/2">
              <div className="inline-block px-3 py-1 mb-4 text-sm rounded-full text-lg bg-white font-bold text-violet-950 border-3 border-primary/20 backdrop-blur-sm">
                AI-Powered Chatbot Platform
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Create Intelligent <span className="bg-clip-text text-white bg-gradient-to-r from-primary to-primary-light">Customer Support</span> Chatbots
              </h1>
              <p className="mx-auto lg:mx-0 max-w-[700px] text-gray-300 md:text-xl">
                Build AI-powered chatbots with RAG technology, sentiment analysis, and seamless Google Sheets integration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center lg:justify-start">
                <a href="/login" className="btn-primary">
                  Start Building Free
                </a>
                <a href="#features" className="btn-secondary">
                  Learn More
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute inset-0 rounded-2xl glow"></div>
                <div className="relative z-10 bg-card/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-white/70">BotGenie</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white text-xs">AI</div>
                      <div className="bg-white/10 rounded-lg p-3 text-sm text-white">
                        Hello! I'm your AI assistant. How can I help you today?
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-primary/30 rounded-lg p-3 text-sm text-white">
                        I need help setting up my account.
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs">U</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-white text-xs">AI</div>
                      <div className="bg-white/10 rounded-lg p-3 text-sm text-white">
                        I'd be happy to help you set up your account! First, let's verify your email address...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-6 md:py-12 lg:py-16 bg-primary/5 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] bg-repeat"></div>
        </div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 mb-4 text-xl rounded-full bg-white text-purple-900 border-3 border-primary/20">
              Features
            </div>
            <h2 className="text-3xl font-bold text-white">Powerful Capabilities</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Everything you need to create intelligent, responsive chatbots that delight your customers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-white group">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-white/90">{feature.title}</h3>
                <p className="text-white/80 group-hover:text-white/90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process and Pricing Section - Combined */}
      <section className="w-full py-6 md:py-12 lg:py-16 bg-blue-50">
        <div className="container px-4 md:px-6">
          {/* How It Works */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-block px-3 py-1 mb-4 text-sm rounded-full bg-primary/10 text-primary-light border border-primary/20">
                Process
              </div>
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-secondary mt-4 max-w-2xl mx-auto">Build and deploy your chatbot in minutes, not days.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {steps.map((step, index) => (
                <div key={index} className="relative flex flex-col items-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center border-2 border-purple-900 text-purple-900 font-bold text-4xl z-10">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-0 left-[calc(50%+1rem)] h-0.5 w-[calc(100%-2rem)] bg-gradient-to-r from-primary to-transparent"></div>
                  )}
                  <div className="pt-8 text-center">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-secondary">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="text-center mb-12">
              <div className="inline-block px-3 py-1 mb-4 text-sm rounded-full bg-primary/10 text-primary-light border border-primary/20">
                Pricing
              </div>
              <h2 className="text-3xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-secondary mt-4 max-w-2xl mx-auto">Choose the plan that works best for your needs.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div key={index} className={`card text-white ${index === 1 ? 'relative scale-105 z-10 animated-gradient' : ''}`}>
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-sm border border-gray-900 font-bold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold mb-4">${plan.price}<span className="text-sm font-normal">/month</span></p>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a href={plan.link} className={`block text-center py-2 px-4 rounded-lg ${index === 1 ? 'bg-white text-gray-900 font-medium' : 'bg-white/20 text-white'} hover:bg-white/90 hover:text-primary transition-colors`}>
                    {index === 1 ? 'Get Started' : 'Choose Plan'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-6 md:py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-90"></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Customer Support?</h2>
            <p className="text-xl mb-8">Join thousands of businesses using BotGenie to deliver exceptional customer experiences.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg hover:bg-white/90 transition-colors">
                Start Your Free Trial
              </a>
              <a href="/contact" className="px-6 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-violet-800 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>,
    title: "RAG-Powered Responses",
    description: "Leverage advanced Retrieval-Augmented Generation for accurate and contextual responses."
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>,
    title: "Sentiment Analysis",
    description: "Automatically detect customer emotions and adjust responses for better engagement."
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
    title: "Google Sheets Integration",
    description: "Seamlessly connect your chatbot to Google Sheets for dynamic data management."
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
    title: "24/7 Availability",
    description: "Provide round-the-clock support to your customers without increasing staffing costs."
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>,
    title: "Secure Transactions",
    description: "Enable secure payment processing directly through your chatbot interface."
  },
  {
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path></svg>,
    title: "Analytics Dashboard",
    description: "Track performance metrics and gain insights to continuously improve your chatbot."
  }
];

const steps = [
  {
    title: "Create Your Bot",
    description: "Set up your chatbot in minutes with our intuitive interface. No coding required."
  },
  {
    title: "Train & Customize",
    description: "Upload your knowledge base and customize responses to match your brand voice."
  },
  {
    title: "Deploy & Scale",
    description: "Integrate with your website or messaging platforms and scale as your business grows."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    price: 29,
    features: [
      "1 Chatbot",
      "1,000 messages/month",
      "Basic analytics",
      "Email support",
      "Google Sheets integration"
    ],
    link: "/signup?plan=starter"
  },
  {
    name: "Professional",
    price: 79,
    features: [
      "3 Chatbots",
      "10,000 messages/month",
      "Advanced analytics",
      "Priority support",
      "All integrations",
      "Custom branding"
    ],
    link: "/signup?plan=professional"
  },
  {
    name: "Enterprise",
    price: 199,
    features: [
      "Unlimited chatbots",
      "Unlimited messages",
      "Custom analytics",
      "Dedicated support",
      "All integrations",
      "Custom development"
    ],
    link: "/signup?plan=enterprise"
  }
];
