import React, { useState, useRef, useEffect } from 'react';
// @mui
import {
  Box,
  Fab,
  Card,
  Stack,
  Paper,
  Avatar,
  TextField,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Backdrop,
  InputAdornment,
  Badge,
  Fade,
  Zoom,
  Grow,
  Chip,
  Collapse
} from '@mui/material';
import { keyframes } from '@mui/material/styles';
// icons
import Iconify from '../iconify';

// Enhanced keyframes for premium animations
const pulseGlow = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 
      0 0 0 0 rgba(0, 176, 240, 0.4),
      0 8px 32px rgba(0, 176, 240, 0.2);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 
      0 0 0 8px rgba(0, 176, 240, 0),
      0 12px 40px rgba(0, 176, 240, 0.4);
  }
  100% {
    transform: scale(1);
    box-shadow: 
      0 0 0 0 rgba(0, 176, 240, 0),
      0 8px 32px rgba(0, 176, 240, 0.2);
  }
`;

const floatMagic = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    filter: hue-rotate(0deg);
  }
  25% {
    transform: translateY(-8px) rotate(1deg);
    filter: hue-rotate(10deg);
  }
  50% {
    transform: translateY(-15px) rotate(0deg);
    filter: hue-rotate(20deg);
  }
  75% {
    transform: translateY(-5px) rotate(-1deg);
    filter: hue-rotate(10deg);
  }
`;

const slideInFromBottom = keyframes`
  from {
    opacity: 0;
    transform: translateY(100%) scale(0.8);
    filter: blur(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0%) scale(1);
    filter: blur(0px);
  }
`;

const slideOutToBottom = keyframes`
  from {
    opacity: 1;
    transform: translateY(0%) scale(1);
    filter: blur(0px);
  }
  to {
    opacity: 0;
    transform: translateY(100%) scale(0.8);
    filter: blur(10px);
  }
`;

const messageAppear = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0px) scale(1);
    filter: blur(0px);
  }
`;

const botMessageAppear = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px) scale(0.8);
    filter: blur(5px);
  }
  to {
    opacity: 1;
    transform: translateX(0px) scale(1);
    filter: blur(0px);
  }
`;

const typingBounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0.3) translateY(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2) translateY(-10px);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

// ----------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface AIChatbotEnhancedProps {
  sx?: object;
}

const mockMessages: Message[] = [
  {
    id: '1',
    text: '¡Hola! 👋 Soy Ally IA, tu asistente virtual con inteligencia artificial. Estoy aquí para transformar la manera en que gestionas tu negocio. Puedo ayudarte con análisis de ventas, predicciones de inventario, insights de clientes y mucho más. ¿En qué aventura digital comenzamos hoy?',
    isBot: true,
    timestamp: new Date(Date.now() - 10000),
    suggestions: [
      '📊 Análisis de ventas del mes',
      '🎯 Productos con mayor potencial',
      '💰 Predicción de ingresos',
      '🔍 Comportamiento de clientes'
    ]
  }
];

const quickSuggestions = [
  '💎 Dashboard inteligente',
  '🚀 Métricas en tiempo real',
  '🎨 Reportes visuales',
  '⚡ Alertas automáticas'
];

export default function AIChatbotEnhanced({ sx, ...other }: AIChatbotEnhancedProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Bloquear scroll del body solo en pantalla completa o móvil
  useEffect(() => {
    if (isOpen && (isFullscreen || isMobile)) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup al desmontar el componente
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isFullscreen, isMobile]);

  const handleClose = () => {
    setIsClosing(true);
    // Esperar a que termine la animación antes de cerrar
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setIsFullscreen(false);
    }, 600); // Duración de la animación
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Excelente pregunta sobre "${text}". Como tu asistente de IA, he analizado los datos más recientes y encontré insights muy interesantes. Basándome en los patrones de comportamiento y las tendencias del mercado, te recomiendo enfocarte en las métricas de conversión y la optimización de la experiencia del cliente. ¿Te gustaría que profundice en algún aspecto específico? ✨`,
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          '📈 Detalles del análisis',
          '🎯 Recomendaciones específicas',
          '📋 Plan de acción',
          '💡 Próximos pasos'
        ]
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
      setShowSuggestions(true);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const renderMessage = (message: Message, index: number) => (
    <Fade in key={message.id} timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: message.isBot ? 'flex-start' : 'flex-end',
          mb: 2,
          animation: message.isBot ? `${botMessageAppear} 0.6s ease-out` : `${messageAppear} 0.5s ease-out`
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-end" maxWidth="85%">
          {message.isBot && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
                mr: 2,
                mt: 0.5
              }}
            >
              <Iconify icon="ph:robot-duotone" width={18} sx={{ color: 'white' }} />
            </Avatar>
          )}

          <Paper
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: message.isBot ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
              background: (t) => {
                if (!message.isBot) return 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)';
                return t.palette.mode === 'dark' ? '#334155' : '#f1f5f9';
              },
              border: (t) => {
                if (!message.isBot) return 'none';
                return t.palette.mode === 'dark'
                  ? '1px solid rgba(71, 85, 105, 0.5)'
                  : '1px solid rgba(148, 163, 184, 0.3)';
              },
              boxShadow: (t) => {
                if (!message.isBot) return '0 4px 12px rgba(0, 176, 240, 0.3)';
                return t.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)';
              },
              position: 'relative'
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: (t) => {
                  if (!message.isBot) return 'white';
                  return t.palette.mode === 'dark' ? 'rgba(255,255,255,0.9)' : '#334155';
                },
                fontWeight: 500,
                lineHeight: 1.6
              }}
            >
              {message.text}
            </Typography>
          </Paper>

          {!message.isBot && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)'
              }}
            >
              <Iconify icon="ph:user-duotone" width={18} sx={{ color: 'white' }} />
            </Avatar>
          )}
        </Stack>
      </Box>
    </Fade>
  );

  const renderTypingIndicator = () => (
    <Fade in={isTyping}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
              mr: 2,
              mt: 0.5
            }}
          >
            <Iconify icon="ph:robot-duotone" width={18} sx={{ color: 'white' }} />
          </Avatar>

          <Paper
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: '20px 20px 20px 5px',
              background: (t) => (t.palette.mode === 'dark' ? '#334155' : '#f1f5f9'),
              border: (t) =>
                t.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(148, 163, 184, 0.3)',
              minWidth: 80
            }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              {[0, 1, 2].map((index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    animation: `${typingBounce} 1.4s ease-in-out infinite`,
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              ))}
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#64748b')
                }}
              >
                Pensando...
              </Typography>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Fade>
  );

  const renderSuggestions = (suggestions: string[]) => (
    <Collapse in={showSuggestions && !isTyping}>
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {suggestions.map((suggestion, index) => (
          <Grow in key={suggestion} timeout={400} style={{ transitionDelay: `${index * 100}ms` }}>
            <Chip
              label={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              sx={{
                background: `linear-gradient(135deg, 
                  rgba(0, 176, 240, 0.1) 0%,
                  rgba(0, 150, 220, 0.2) 100%)`,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 176, 240, 0.3)',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 32,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: `linear-gradient(135deg, 
                    rgba(0, 176, 240, 0.2) 0%,
                    rgba(0, 150, 220, 0.3) 100%)`,
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 8px 25px rgba(0, 176, 240, 0.3)'
                },
                '&:active': {
                  transform: 'translateY(0px) scale(0.98)'
                }
              }}
            />
          </Grow>
        ))}
      </Stack>
    </Collapse>
  );

  const chatWindow = (
    <Card
      sx={{
        position: 'fixed',
        // Posicionamiento
        bottom: isFullscreen || isMobile ? 0 : 100,
        right: isMobile ? 0 : isFullscreen ? '50%' : 24,
        top: isFullscreen || isMobile ? 0 : 'auto',
        left: isMobile ? 0 : isFullscreen ? '50%' : 'auto',

        // Dimensiones
        width: isMobile ? '100vw' : isFullscreen ? '90vw' : 400,
        height: isFullscreen || isMobile ? '100vh' : 600,
        maxWidth: isMobile ? 'none' : isFullscreen ? '1200px' : '400px',
        maxHeight: isFullscreen || isMobile ? '100vh' : '80vh',

        // Transform para centrar en fullscreen desktop
        ...(isFullscreen &&
          !isMobile && {
            transform: 'translateX(-50%)'
          }),

        background: (theme) =>
          theme.palette.mode === 'dark'
            ? '#1e293b' // Dark solid background
            : '#f8fafc', // Light solid background más claro
        border: (theme) =>
          theme.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.5)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: isFullscreen || isMobile ? 0 : 3,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
        zIndex: theme.zIndex.modal,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: isClosing
          ? `${slideOutToBottom} 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`
          : `${slideInFromBottom} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
        transformOrigin: isFullscreen || isMobile ? 'center center' : 'bottom right'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
          borderBottom: (theme) =>
            theme.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(0, 76, 151, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: '#4CAF50',
                    border: '2px solid white',
                    animation: `${pulseGlow} 2s ease-in-out infinite`
                  }}
                />
              }
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  background: `linear-gradient(135deg, 
                    rgba(0, 176, 240, 0.3) 0%,
                    rgba(0, 150, 220, 0.6) 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  animation: `${floatMagic} 8s ease-in-out infinite`
                }}
              >
                <Iconify icon="ph:robot-duotone" width={28} sx={{ color: 'white' }} />
              </Avatar>
            </Badge>

            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff' : '#ffffff')
                }}
              >
                Ally IA
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)')
                }}
              >
                🚀 Asistente Inteligente • En línea
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            {/* Botón pantalla completa - solo en desktop */}
            {!isMobile && (
              <IconButton
                onClick={() => setIsFullscreen(!isFullscreen)}
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <Iconify icon={isFullscreen ? 'eva:minimize-fill' : 'eva:expand-fill'} width={20} />
              </IconButton>
            )}

            <IconButton
              onClick={handleClose}
              sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.2)',
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Iconify icon="eva:close-fill" width={20} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? '#0f172a' // Dark messages background
              : '#ffffff', // Light messages background - más claro
          '&::-webkit-scrollbar': {
            width: 6
          },
          '&::-webkit-scrollbar-track': {
            background: (theme) => (theme.palette.mode === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(0, 0, 0, 0.05)')
          },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => (theme.palette.mode === 'dark' ? 'rgba(71, 85, 105, 0.5)' : 'rgba(0, 0, 0, 0.2)'),
            borderRadius: 3
          }
        }}
      >
        {messages.map((message, index) => renderMessage(message, index))}
        {isTyping && renderTypingIndicator()}

        {/* Show suggestions from last bot message */}
        {messages.length > 0 &&
          messages[messages.length - 1]?.isBot &&
          messages[messages.length - 1]?.suggestions &&
          renderSuggestions(messages[messages.length - 1].suggestions || [])}

        <Box ref={messagesEndRef} />
      </Box>

      {/* Quick Suggestions */}
      <Collapse in={messages.length === 1 && !isTyping}>
        <Box sx={{ px: 2, pb: 1 }}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {quickSuggestions.map((suggestion, index) => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{
                  background: `linear-gradient(135deg, 
                    rgba(0, 176, 240, 0.1) 0%,
                    rgba(0, 150, 220, 0.15) 100%)`,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 176, 240, 0.2)',
                  color: 'primary.main',
                  fontWeight: 500,
                  fontSize: '0.7rem',
                  height: 28,
                  '&:hover': {
                    background: `linear-gradient(135deg, 
                      rgba(0, 176, 240, 0.2) 0%,
                      rgba(0, 150, 220, 0.25) 100%)`,
                    transform: 'translateY(-1px)'
                  }
                }}
              />
            ))}
          </Stack>
        </Box>
      </Collapse>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          background: (theme) => (theme.palette.mode === 'dark' ? '#334155' : '#f8fafc'), // Más claro en modo diurno
          borderTop: (theme) =>
            theme.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.3)' : '1px solid rgba(148, 163, 184, 0.2)' // Borde más visible
        }}
      >
        <TextField
          fullWidth
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
          placeholder="Escribe tu mensaje aquí..."
          multiline
          maxRows={4}
          disabled={isTyping}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              background: (theme) => (theme.palette.mode === 'dark' ? '#475569' : '#ffffff'), // Blanco puro en modo diurno
              border: (theme) =>
                theme.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.5)' : '2px solid #e2e8f0', // Borde más claro pero visible
              pr: 1,
              '& fieldset': {
                border: 'none'
              },
              '&:hover': {
                background: (theme) => (theme.palette.mode === 'dark' ? '#64748b' : '#ffffff'),
                border: (theme) =>
                  theme.palette.mode === 'dark' ? '1px solid rgba(71, 85, 105, 0.7)' : '2px solid #cbd5e1' // Borde más oscuro en hover
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(0, 176, 240, 0.3)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(0, 176, 240, 0.5)'
                    : '2px solid rgba(0, 176, 240, 0.4)'
              }
            },
            '& .MuiInputBase-input': {
              color: (theme) => (theme.palette.mode === 'dark' ? '#ffffff' : '#334155'),
              fontWeight: 500,
              '&::placeholder': {
                color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.6)' : '#64748b'),
                opacity: 1
              }
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    sx={{
                      background: 'rgba(156, 39, 176, 0.1)',
                      color: 'primary.main',
                      '&:hover': {
                        background: 'rgba(156, 39, 176, 0.2)',
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Iconify icon="ph:microphone-duotone" width={16} />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isTyping}
                    sx={{
                      background:
                        inputValue.trim() && !isTyping
                          ? `linear-gradient(135deg, 
                            rgba(0, 176, 240, 0.8) 0%,
                            rgba(0, 150, 220, 0.9) 100%)`
                          : 'rgba(255, 255, 255, 0.1)',
                      color: inputValue.trim() && !isTyping ? 'white' : 'text.disabled',
                      '&:hover': {
                        background:
                          inputValue.trim() && !isTyping
                            ? `linear-gradient(135deg, 
                              rgba(0, 176, 240, 0.9) 0%,
                              rgba(0, 150, 220, 1) 100%)`
                            : 'rgba(255, 255, 255, 0.15)',
                        transform: inputValue.trim() && !isTyping ? 'scale(1.1)' : 'none'
                      },
                      '&:disabled': {
                        opacity: 0.5
                      },
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <Iconify icon="ph:paper-plane-tilt-duotone" width={16} />
                  </IconButton>
                </Stack>
              </InputAdornment>
            )
          }}
        />
      </Box>
    </Card>
  );

  return (
    <>
      {/* Floating Action Button */}
      <Zoom in={!isOpen}>
        <Fab
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: isMobile ? 20 : 24,
            right: isMobile ? 20 : 24,
            width: 64,
            height: 64,
            borderRadius: 3, // Menos redondo
            background: `linear-gradient(135deg, 
              rgba(0, 176, 240, 0.9) 0%,
              rgba(0, 150, 220, 1) 100%)`,
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 12px 40px rgba(0, 176, 240, 0.4)',
            zIndex: theme.zIndex.fab,
            animation: `${pulseGlow} 3s ease-in-out infinite, ${floatMagic} 6s ease-in-out infinite`,
            '&:hover': {
              background: `linear-gradient(135deg, 
                rgba(0, 176, 240, 1) 0%,
                rgba(0, 130, 200, 1) 100%)`,
              transform: 'scale(1.1) rotate(10deg)'
            },
            '&:active': {
              transform: 'scale(0.95)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            ...sx
          }}
          {...other}
        >
          <Iconify
            icon="ph:robot-duotone"
            width={32}
            sx={{
              color: 'white',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
            }}
          />
        </Fab>
      </Zoom>

      {/* Chat Window */}
      {isOpen && (
        <>
          {/* Backdrop - solo visible en pantalla completa o móvil */}
          <Backdrop
            open={isOpen && (isFullscreen || isMobile)}
            onClick={handleClose}
            sx={{
              zIndex: theme.zIndex.modal - 1,
              background: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)'
            }}
          />

          {/* Backdrop invisible para desktop en modo ventana - para cerrar al hacer click fuera */}
          {!isFullscreen && !isMobile && (
            <Box
              onClick={handleClose}
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: theme.zIndex.modal - 1,
                background: 'transparent'
              }}
            />
          )}

          {chatWindow}
        </>
      )}
    </>
  );
}
