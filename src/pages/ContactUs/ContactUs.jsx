import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import BistroBoss from "../Shared/BistroBoss/BistroBoss";
import image from "../../assets/contact/banner.jpg";
import SectionTitle from "../../components/SectionTitle/SectionTitle";
import {
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import useAxiosSecure from "../../hooks/useAxiosSecure";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });
  const recaptchaRef = useRef();
  const axiosSecure = useAxiosSecure();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRecaptchaChange = (value) => {
    setRecaptchaValue(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Clear any existing message timeout
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    setSubmitMessage({ type: "", text: "" });

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitMessage({
        type: "error",
        text: "Name, email and message are required",
      });
      setIsSubmitting(false);

      // Set timeout to hide the error message after 5 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setSubmitMessage({ type: "", text: "" });
      }, 5000);

      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitMessage({
        type: "error",
        text: "Please enter a valid email address",
      });
      setIsSubmitting(false);

      messageTimeoutRef.current = setTimeout(() => {
        setSubmitMessage({ type: "", text: "" });
      }, 5000);

      return;
    }

    if (formData.phone) {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        setSubmitMessage({
          type: "error",
          text: "Please enter a valid phone number",
        });
        setIsSubmitting(false);

        messageTimeoutRef.current = setTimeout(() => {
          setSubmitMessage({ type: "", text: "" });
        }, 5000);

        return;
      }
    }

    if (!recaptchaValue) {
      setSubmitMessage({
        type: "error",
        text: "Please verify you are not a robot",
      });
      setIsSubmitting(false);

      messageTimeoutRef.current = setTimeout(() => {
        setSubmitMessage({ type: "", text: "" });
      }, 5000);

      return;
    }

    try {
      // Send form data to backend
      const response = await axiosSecure.post("/email/contact", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setSubmitMessage({ type: "success", text: "Message sent successfully!" });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setRecaptchaValue(null);
      recaptchaRef.current.reset();

      // Set timeout to hide the success message after 5 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setSubmitMessage({ type: "", text: "" });
      }, 5000);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage({
        type: "error",
        text: error.message || "Error submitting form. Please try again.",
      });

      // Set timeout to hide the error message after 5 seconds
      messageTimeoutRef.current = setTimeout(() => {
        setSubmitMessage({ type: "", text: "" });
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <BistroBoss
        image={image}
        title={"CONTACT US"}
        subTitle={"Let's start a conversation"}
        height="h-[450px]"
        overlay="bg-gray-900/70"
      />

      <div className="container mx-auto px-4 py-16">
        <SectionTitle
          subHeading={"OUR LOCATION"}
          heading={"Visit Our Restaurant"}
          center={true}
          subColor="text-gray-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
          <ContactCard
            icon={<FaPhone className="text-xl text-orange-600" />}
            title="PHONE"
            content="+8801580768366"
            description="Call us for reservations"
          />
          <ContactCard
            icon={<FaMapMarkerAlt className="text-xl text-orange-600" />}
            title="ADDRESS"
            content="123 Gourmet Street"
            description="Food District, Dhaka"
          />
          <ContactCard
            icon={<FaClock className="text-xl text-orange-600" />}
            title="WORKING HOURS"
            content={
              <>
                <p className="font-medium">Mon - Fri: 09:00 - 22:00</p>
                <p className="font-medium">Sat - Sun: 10:00 - 23:00</p>
              </>
            }
            description="Weekend extended hours"
          />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
            <div className="md:flex">
              <div className="md:w-2/5 bg-gray-50 p-12 border-r border-gray-200">
                <h2 className="text-3xl font-serif font-light text-gray-800 mb-8">
                  How Can We Help?
                </h2>
                <p className="mb-10 text-gray-600 leading-relaxed">
                  Have questions about our menu, reservations, or special
                  events? Our team is ready to assist you with any inquiries.
                </p>

                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaEnvelope className="text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Email Us
                      </h3>
                      <p className="mt-1 text-gray-800">
                        khairulislamseam01@gmail.com
                      </p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaPhone className="text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Call Us
                      </h3>
                      <p className="mt-1 text-gray-800">+8801580768366</p>
                    </div>
                  </div>

                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaClock className="text-gray-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        Opening Hours
                      </h3>
                      <p className="mt-1 text-gray-800">Monday - Sunday</p>
                      <p className="text-gray-600">9:00 AM - 11:00 PM</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Visit Our Location
                  </h3>
                  <div className="w-full h-72 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d213890.95374088985!2d90.254532094215!3d23.781066872097394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sDhaka!5e1!3m2!1sen!2sbd!4v1753095989936!5m2!1sen!2sbd"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                    ></iframe>
                  </div>
                </div>
              </div>

              <div className="md:w-3/5 p-12">
                <SectionTitle
                  subHeading={"SEND A MESSAGE"}
                  heading={"Contact Form"}
                  center={false}
                  subColor="text-gray-500"
                />

                <form onSubmit={handleSubmit} className="mt-8 text-gray-600">
                  {submitMessage.text && (
                    <div
                      className={`mb-6 p-4 rounded-lg ${
                        submitMessage.type === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {submitMessage.text}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider"
                      >
                        Full Name *
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider"
                      >
                        Email Address *
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider"
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+8801580768366"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2 uppercase tracking-wider"
                    >
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg h-40 focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
                      required
                    />
                  </div>

                  <div className="mb-8">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                      onChange={handleRecaptchaChange}
                      className="recaptcha-wrapper"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full font-medium py-3 rounded-xl shadow-md transition-all duration-300 mb-4 cursor-pointer ${
                      isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white transform active:scale-[0.98]"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Contact Card Component
const ContactCard = ({ icon, title, content, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
    <div className="text-gray-700 font-medium text-lg mb-2">{content}</div>
    {description && <p className="text-gray-500 text-sm">{description}</p>}
  </div>
);

export default ContactUs;
