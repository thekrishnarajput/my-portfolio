import { useState, useEffect /*, useRef, useCallback */ } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaLinkedin, FaEnvelope, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { contactAPI, linkedinAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { useRecaptcha } from '../../contexts/RecaptchaContext';

interface ContactProps {
  config?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    description?: string;
    email?: string;
    linkedinUrl?: string;
    showLinkedInFollowers?: boolean;
  };
}

/*
const MAX_FILES = 5;
const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
];
*/

/*
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/')) return <FaImage className="text-violet-400" />;
  if (mime === 'application/pdf') return <FaFilePdf className="text-red-400" />;
  if (mime.includes('word')) return <FaFileWord className="text-blue-400" />;
  if (mime.includes('excel') || mime.includes('spreadsheet')) return <FaFileExcel className="text-green-400" />;
  return <FaFileAlt className="text-gray-400" />;
}
*/

const Contact = ({ config }: ContactProps) => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  /*
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  */
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [linkedinFollowers, setLinkedinFollowers] = useState<number | null>(null);
  // const fileInputRef = useRef<HTMLInputElement>(null);
  const { showFromResponse, showError } = useToast();
  const { executeRecaptcha, recaptchaError } = useRecaptcha();
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    fetchLinkedInFollowers();
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (status === 'success' || status === 'error') {
      timeout = setTimeout(() => setStatus('idle'), 10000);
    }
    return () => clearTimeout(timeout);
  }, [status]);

  const fetchLinkedInFollowers = async () => {
    try {
      const response = await linkedinAPI.getFollowers();
      if (response.data.data.followers) setLinkedinFollowers(response.data.data.followers);
    } catch {
      /* silent */
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Attachment helpers ──────────────────────────────────────────────────────
  /*
  const addFiles = useCallback((incoming: File[]) => {
    const errs: string[] = [];
    const valid: File[] = [];

    for (const f of incoming) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errs.push(`"${f.name}" is not an allowed file type.`);
        continue;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        errs.push(`"${f.name}" exceeds ${MAX_SIZE_MB} MB limit.`);
        continue;
      }
      valid.push(f);
    }

    setAttachments((prev) => {
      const merged = [...prev, ...valid];
      if (merged.length > MAX_FILES) {
        errs.push(`Maximum ${MAX_FILES} files allowed. Extra files ignored.`);
        return merged.slice(0, MAX_FILES);
      }
      return merged;
    });

    setAttachmentErrors(errs);
  }, []);

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
    setAttachmentErrors([]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = ''; // allow re-selecting the same file
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };
  */

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');

    if (!executeRecaptcha) {
      showError({
        response: {
          data: { message: 'ReCAPTCHA is still loading. Please try again in a moment.' },
        },
      });
      setStatus('error');
      setLoading(false);
      return;
    }

    try {
      const token = await executeRecaptcha('contact_form');
      const response = await contactAPI.send({
        ...formData,
        recaptchaToken: token /*, attachments */,
      });
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      // setAttachments([]);
      // setAttachmentErrors([]);
      showFromResponse(response);
    } catch (error) {
      setStatus('error');
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {config?.title || 'Get In Touch'}
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-8" />
          {config?.subtitle && (
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-4">
              {config.subtitle}
            </p>
          )}
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {config?.description ||
              "Have a project in mind or want to collaborate? I'd love to hear from you!"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              {/* Message */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* ── Attachment Zone (Temporarily Disabled) ──────────────────────
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attachments <span className="text-gray-400 font-normal">(optional · max {MAX_FILES} files · {MAX_SIZE_MB} MB each)</span>
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-4 py-5 transition-colors
                    ${dragOver
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 bg-gray-50 dark:bg-gray-800/60'}`}
                >
                  <FaPaperclip className={`w-5 h-5 ${dragOver ? 'text-primary-500' : 'text-gray-400'}`} />
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    {dragOver ? 'Drop files here' : 'Click to browse or drag & drop files'}
                  </p>
                  <p className="text-xs text-gray-400">Images, PDF, Word, Excel, TXT/CSV</p>
                  <input ref={fileInputRef} type="file" multiple accept={ALLOWED_TYPES.join(',')} className="hidden" onChange={handleFileInput} />
                </div>

                {attachmentErrors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {attachmentErrors.map((e, i) => (
                      <li key={i} className="text-xs text-red-500 flex items-center gap-1"><FaExclamationCircle />{e}</li>
                    ))}
                  </ul>
                )}

                {attachments.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {attachments.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                        <span className="flex-shrink-0 text-base">{fileIcon(f.type)}</span>
                        <span className="flex-1 min-w-0 text-sm text-gray-800 dark:text-gray-200 truncate">{f.name}</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatBytes(f.size)}</span>
                        <button type="button" onClick={() => removeAttachment(i)}
                          className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors ml-1">
                          <FaTimes className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              ─────────────────────────────────────────────────────────── */}
              {/* ─────────────────────────────────────────────────────────── */}

              {status === 'success' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <FaCheckCircle /> Message sent successfully!
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <FaExclamationCircle /> Failed to send message. Please try again.
                </div>
              )}
              <button
                type="submit"
                disabled={loading || !executeRecaptcha}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Sending...'
                  : !executeRecaptcha
                    ? recaptchaError || 'Loading ReCAPTCHA...'
                    : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Connect With Me
              </h3>
              <div className="space-y-6">
                {config?.linkedinUrl && (
                  <a
                    href={config.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                      <FaLinkedin className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">LinkedIn</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {config.showLinkedInFollowers !== false && linkedinFollowers !== null
                          ? `${linkedinFollowers} followers`
                          : 'Connect with me'}
                      </p>
                    </div>
                  </a>
                )}
                {config?.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                      <FaEnvelope className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Email</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{config.email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white">
              <h3 className="text-xl font-bold mb-4">Let's Work Together</h3>
              <p className="text-primary-100">
                I'm always open to discussing new projects, creative ideas, or opportunities to be
                part of your vision.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
