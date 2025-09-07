import React, { useState, useRef, useEffect } from 'react';
// @mui
import {
  Box,
  Fab,
  Card,
  Stack,
  Paper,
  Avatar,
  Divider,
  TextField,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
  Backdrop,
  InputAdornment,
  Badge,
  Fade,
  Zoom,
  Grow,
  Chip,
  Collapse,
} from '@mui/material';
import { alpha, keyframes } from '@mui/material/styles';
// icons
import Iconify from '../iconify';
// hooks
import { useAuthContext } from 'src/auth/hooks';

// Mock data
const mockAIChatData = {
  messages: [
    {
      id: 1,
      type: 'bot',
      content: '¡Hola! Soy tu asistente de IA de Ally360. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ],
  suggestions: [
    'Mostrar métricas de ventas',
    'Análizar rendimiento',
    'Generar reporte',
    'Configurar alertas',
  ],
};

// Enhanced keyframes for smoother animations
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-10px) rotate(2deg);
  }
  66% {
    transform: translateY(5px) rotate(-1deg);
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 5px rgba(33, 150, 243, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(33, 150, 243, 0.8));
  }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
`;

const messageSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.9);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateX(0px) scale(1);
    filter: blur(0px);
  }
`;

const botMessageSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.9);
    filter: blur(3px);
  }
  to {
    opacity: 1;
    transform: translateX(0px) scale(1);
    filter: blur(0px);
  }
`;

const typingDots = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const typingAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const slideInMessage = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }
`;

const breatheAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
`;

// ----------------------------------------------------------------------

// Mock data
const aiChatMessages = [
  {
    id: '1',
    text: '¡Hola! Soy Ally IA, tu asistente virtual de inteligencia artificial. Estoy aquí para ayudarte a tomar mejores decisiones para tu negocio. Puedo responder preguntas sobre ventas, inventario, clientes y generar análisis inteligentes. ¿En qué puedo ayudarte hoy?',
    isBot: true,
    timestamp: new Date(Date.now() - 10000),
    suggestions: [
      '¿Cuál fue mi producto más vendido ayer?',
      'Mostrar inventario actual',
      '¿Qué clientes me deben dinero?',
      'Análisis de productos con baja rotación',
    ],
  },
];

const aiSuggestions = [
  'Ventas de hoy',
  'Mejor producto',
  'Inventario bajo',
  'Clientes morosos',
  'Reporte mensual',
  'Productos lentos',
];

// ----------------------------------------------------------------------

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export default function AIChatbot() {
  const { user } = useAuthContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(aiChatMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(text.trim());
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isBot: true,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('producto') && lowerMessage.includes('más')) {
      return {
        text: "Tu producto más vendido ayer fue 'Camiseta Polo Azul' con 15 unidades vendidas, generando $450.000 en ingresos.",
        suggestions: ["¿Qué productos rotan más lento?", "Mostrar inventario actual", "Comparar ventas del mes"]
      };
    }
    
    if (lowerMessage.includes('inventario')) {
      return {
        text: "Actualmente tienes 1,247 productos en inventario. Los productos con mayor stock son: Camisetas (156 unidades), Pantalones (98 unidades), Zapatos (87 unidades).",
        suggestions: ["¿Cuáles están por agotarse?", "Productos con menor rotación", "Valor total del inventario"]
      };
    }
    
    if (lowerMessage.includes('cliente') && lowerMessage.includes('debe')) {
      return {
        text: "El cliente que más te debe actualmente es 'Distribuidora del Norte S.A.S' con un saldo pendiente de $2.850.000 correspondiente a 3 facturas vencidas.",
        suggestions: ["Enviar recordatorio de pago", "Ver todas las cuentas por cobrar", "Generar reporte de cartera"]
      };
    }
    
    if (lowerMessage.includes('rotan') && lowerMessage.includes('lento')) {
      return {
        text: "Los productos con menor rotación son: Chaqueta de Invierno (45 días sin venta) y Zapatos Formales (30 días). Te recomiendo crear una promoción del 20% para acelerar la rotación.",
        suggestions: ["Crear promoción automática", "Ver análisis de temporada", "Sugerir descuentos"]
      };
    }
    
    return {
      text: "¡Hola! Soy Ally IA, tu asistente virtual. Puedo ayudarte con consultas sobre ventas, inventario, clientes y generar análisis inteligentes para tu negocio. ¿En qué puedo ayudarte hoy?",
      suggestions: ["¿Cuál fue mi mejor producto ayer?", "¿Qué productos están por agotarse?", "Mostrar resumen de ventas"]
    };
  };

  const handleToggleChat = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const ChatContent = (
    <Stack sx={{ height: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.9) 0%, rgba(0, 76, 151, 0.9) 100%)',
          p: 2.5,
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.1) 0%, rgba(0, 76, 151, 0.1) 100%)',
            borderRadius: '0 0 20px 20px',
            zIndex: 0,
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ zIndex: 1 }}>
          <Zoom in={isOpen} timeout={500}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'common.white',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                animation: `${floatAnimation} 3s ease-in-out infinite`,
              }}
            >
              <Iconify icon="hugeicons:ai-brain-04" width={24} />
            </Avatar>
          </Zoom>
          <Box>
            <Fade in={isOpen} timeout={800}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Ally IA - Asistente Virtual
              </Typography>
            </Fade>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Fade in={isOpen} timeout={1000}>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                  Conectado
                </Typography>
              </Fade>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  animation: `${pulseAnimation} 2s infinite`,
                }}
              />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ zIndex: 1 }}>
          {!isMobile && (
            <Fade in={isOpen} timeout={1200}>
              <IconButton
                onClick={handleMaximize}
                sx={{ 
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <Iconify icon={isMaximized ? "material-symbols:fullscreen-exit" : "material-symbols:fullscreen"} />
              </IconButton>
            </Fade>
          )}
          <Fade in={isOpen} timeout={1400}>
            <IconButton
              onClick={() => setIsOpen(false)}
              sx={{ 
                color: 'inherit',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Iconify icon="material-symbols:close" />
            </IconButton>
          </Fade>
        </Stack>
      </Box>

      {/* Messages */}
      <Stack
        sx={{
          flex: 1,
          p: 3,
          overflow: 'auto',
          background: 'linear-gradient(180deg, rgba(248, 249, 250, 0.5) 0%, rgba(233, 236, 239, 0.5) 100%)',
          '&::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.grey[500], 0.1),
            borderRadius: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 4,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
            },
          },
        }}
        spacing={3}
      >
        {messages.map((message, index) => (
          <Grow
            key={message.id}
            in={true}
            timeout={500 + index * 100}
            style={{ transformOrigin: message.isBot ? 'left center' : 'right center' }}
          >
            <Box>
              {/* User Message */}
              {!message.isBot && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Paper
                    elevation={3}
                    sx={{
                      background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
                      color: '#fff',
                      px: 3,
                      py: 2,
                      borderRadius: '20px 20px 5px 20px',
                      maxWidth: '75%',
                      position: 'relative',
                      boxShadow: '0 4px 20px rgba(0, 176, 240, 0.3)',
                      animation: `${slideInMessage} 0.5s ease-out`,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        right: -8,
                        bottom: 0,
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderTop: '8px solid #00B0F0',
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 176, 240, 0.4)',
                        transition: 'all 0.3s ease',
                      },
                    }}
                  >
                    <Typography variant="body1" sx={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Bot Message */}
              {message.isBot && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '85%' }}>
                    <Zoom in={true} timeout={300}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
                          mr: 2,
                          mt: 0.5,
                          flexShrink: 0,
                          animation: `${floatAnimation} 4s ease-in-out infinite`,
                          boxShadow: '0 4px 15px rgba(0, 176, 240, 0.3)',
                        }}
                      >
                        <Iconify icon="hugeicons:ai-brain-04" width={20} />
                      </Avatar>
                    </Zoom>
                    <Paper
                      elevation={2}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        px: 3,
                        py: 2.5,
                        borderRadius: '20px 20px 20px 5px',
                        border: '1px solid rgba(0, 176, 240, 0.1)',
                        position: 'relative',
                        animation: `${slideInMessage} 0.6s ease-out`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -8,
                          bottom: 0,
                          width: 0,
                          height: 0,
                          borderRight: '8px solid rgba(255, 255, 255, 0.95)',
                          borderTop: '8px solid rgba(255, 255, 255, 0.95)',
                          borderLeft: '8px solid transparent',
                          borderBottom: '8px solid transparent',
                        },
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600, 
                          color: '#00B0F0',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}>
                          Ally IA
                        </Typography>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: '#4CAF50',
                            animation: `${pulseAnimation} 2s infinite`,
                          }}
                        />
                      </Stack>
                      <Typography variant="body1" sx={{ 
                        fontSize: '0.95rem', 
                        lineHeight: 1.6, 
                        color: '#333',
                        mb: message.suggestions ? 2 : 0,
                      }}>
                        {message.text}
                      </Typography>
                      
                      {/* Suggestions */}
                      {message.suggestions && (
                        <Box>
                          <Divider sx={{ my: 2, borderColor: 'rgba(0, 176, 240, 0.1)' }} />
                          <Typography variant="caption" sx={{ 
                            color: '#00B0F0', 
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            mb: 1,
                            display: 'block',
                          }}>
                            Sugerencias rápidas
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                            {message.suggestions.map((suggestion, index) => (
                              <Fade key={index} in={true} timeout={800 + index * 200}>
                                <Paper
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  sx={{
                                    px: 2,
                                    py: 1,
                                    background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.1) 0%, rgba(0, 76, 151, 0.1) 100%)',
                                    border: '1px solid rgba(0, 176, 240, 0.2)',
                                    borderRadius: 20,
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    color: '#00B0F0',
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.2) 0%, rgba(0, 76, 151, 0.2) 100%)',
                                      transform: 'translateY(-2px) scale(1.02)',
                                      boxShadow: '0 4px 15px rgba(0, 176, 240, 0.3)',
                                      borderColor: 'rgba(0, 176, 240, 0.4)',
                                    },
                                    '&:active': {
                                      transform: 'translateY(0) scale(0.98)',
                                    },
                                  }}
                                >
                                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                    {suggestion}
                                  </Typography>
                                </Paper>
                              </Fade>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Box>
              )}
            </Box>
          </Grow>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <Fade in={isTyping} timeout={300}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '85%' }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
                    mr: 2,
                    mt: 0.5,
                    flexShrink: 0,
                    animation: `${pulseAnimation} 1s infinite`,
                  }}
                >
                  <Iconify icon="hugeicons:ai-brain-04" width={20} />
                </Avatar>
                <Paper
                  elevation={2}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    px: 3,
                    py: 2.5,
                    borderRadius: '20px 20px 20px 5px',
                    border: '1px solid rgba(0, 176, 240, 0.1)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      bottom: 0,
                      width: 0,
                      height: 0,
                      borderRight: '8px solid rgba(255, 255, 255, 0.95)',
                      borderTop: '8px solid rgba(255, 255, 255, 0.95)',
                      borderLeft: '8px solid transparent',
                      borderBottom: '8px solid transparent',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ 
                      fontWeight: 600, 
                      color: '#00B0F0',
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Ally IA
                    </Typography>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50',
                        animation: `${pulseAnimation} 2s infinite`,
                      }}
                    />
                  </Stack>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ mr: 1, color: '#666' }}>
                      Analizando datos
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 0.5,
                        '& .dot': {
                          width: 8,
                          height: 8,
                          backgroundColor: '#00B0F0',
                          borderRadius: '50%',
                          animation: `${typingAnimation} 1.4s infinite ease-in-out`,
                          '&:nth-of-type(2)': {
                            animationDelay: '0.2s',
                          },
                          '&:nth-of-type(3)': {
                            animationDelay: '0.4s',
                          },
                        },
                      }}
                    >
                      <Box className="dot" />
                      <Box className="dot" />
                      <Box className="dot" />
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Fade>
        )}

        <Box ref={messagesEndRef} />
      </Stack>

      <Divider sx={{ borderColor: 'rgba(0, 176, 240, 0.1)' }} />

      {/* Input Section */}
      <Box sx={{ 
        p: 3, 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
      }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(248, 249, 250, 0.8)',
            borderRadius: 25,
            px: 3,
            py: 1.5,
            border: '2px solid rgba(0, 176, 240, 0.1)',
            transition: 'all 0.3s ease',
            '&:focus-within': {
              borderColor: 'rgba(0, 176, 240, 0.4)',
              boxShadow: '0 0 20px rgba(0, 176, 240, 0.2)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={3}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Pregúntame sobre tu negocio..."
            variant="standard"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            InputProps={{
              disableUnderline: true,
              sx: {
                fontSize: '1rem',
                '& input::placeholder': {
                  color: '#aaa',
                  opacity: 1,
                },
              },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ ml: 1 }}>
            <Zoom in={true} timeout={600}>
              <IconButton
                sx={{
                  color: '#666',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#00B0F0',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <Iconify icon="material-symbols:mic" />
              </IconButton>
            </Zoom>
            <Zoom in={true} timeout={800}>
              <IconButton
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim()}
                sx={{
                  background: inputValue.trim() 
                    ? 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)'
                    : 'rgba(0, 0, 0, 0.1)',
                  color: inputValue.trim() ? '#fff' : '#aaa',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: inputValue.trim() 
                      ? 'linear-gradient(135deg, #00B0F0 0%, #003d7a 100%)'
                      : 'rgba(0, 0, 0, 0.15)',
                    transform: 'scale(1.1)',
                    boxShadow: inputValue.trim() ? '0 4px 15px rgba(0, 176, 240, 0.4)' : 'none',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.05)',
                    color: '#ccc',
                  },
                }}
              >
                <Iconify icon="material-symbols:send" />
              </IconButton>
            </Zoom>
          </Stack>
        </Box>

        {/* Quick Suggestions */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ 
            color: '#00B0F0', 
            fontWeight: 600,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            mb: 1,
            display: 'block',
          }}>
            Consultas rápidas
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            {aiSuggestions.map((suggestion, index) => (
              <Fade key={index} in={isOpen} timeout={1000 + index * 150}>
                <Paper
                  onClick={() => handleSuggestionClick(suggestion)}
                  sx={{
                    px: 2,
                    py: 1,
                    background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.08) 0%, rgba(0, 76, 151, 0.08) 100%)',
                    border: '1px solid rgba(0, 176, 240, 0.15)',
                    borderRadius: 20,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: '#00B0F0',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0, 176, 240, 0.15) 0%, rgba(0, 76, 151, 0.15) 100%)',
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: '0 4px 15px rgba(0, 176, 240, 0.2)',
                      borderColor: 'rgba(0, 176, 240, 0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    },
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    {suggestion}
                  </Typography>
                </Paper>
              </Fade>
            ))}
          </Stack>
        </Box>
      </Box>
    </Stack>
  );

  return (
    <>
      {/* Floating Action Button */}
      <Badge
        badgeContent={hasNewMessage ? "!" : null}
        color="error"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Zoom in={true} timeout={1000}>
          <Fab
            onClick={handleToggleChat}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: theme.zIndex.speedDial,
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #00B0F0 0%, #004C97 100%)',
              color: theme.palette.common.white,
              boxShadow: '0 8px 32px rgba(0, 176, 240, 0.4)',
              animation: `${floatAnimation} 3s ease-in-out infinite`,
              ...(isMobile && {
                bottom: 80,
                right: 16,
                width: 56,
                height: 56,
              }),
              '&:hover': {
                background: 'linear-gradient(135deg, #00B0F0 0%, #003d7a 100%)',
                boxShadow: '0 12px 40px rgba(0, 176, 240, 0.6)',
                transform: 'scale(1.1) translateY(-5px)',
                animation: 'none',
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -3,
                left: -3,
                right: -3,
                bottom: -3,
                background: 'linear-gradient(45deg, #00B0F0, #004C97, #4CAF50, #00B0F0)',
                borderRadius: '50%',
                zIndex: -1,
                animation: `${glowAnimation} 3s ease-in-out infinite`,
                opacity: 0.7,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '120%',
                height: '120%',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 176, 240, 0.3) 0%, transparent 70%)',
                transform: 'translate(-50%, -50%)',
                zIndex: -2,
                animation: `${pulseAnimation} 2s ease-in-out infinite`,
              },
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Iconify icon="hugeicons:ai-brain-04" width={32} />
          </Fab>
        </Zoom>
      </Badge>

      {/* Chat Window */}
      <Backdrop
        open={isOpen}
        onClick={() => setIsOpen(false)}
        sx={{
          zIndex: (theme) => theme.zIndex.modal - 1,
          backgroundColor: alpha(theme.palette.common.black, 0.5),
          backdropFilter: 'blur(4px)',
        }}
      />

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit timeout={600}>
        <Fade in={isOpen} timeout={800}>
          <Card
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'fixed',
              ...(isMaximized && !isMobile
                ? {
                    top: 24,
                    left: 24,
                    right: 24,
                    bottom: 24,
                  }
                : {
                    bottom: 100,
                    right: 24,
                    width: 420,
                    height: 650,
                    ...(isMobile && {
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: 0,
                    }),
                  }),
              zIndex: theme.zIndex.modal,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 176, 240, 0.2)',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                zIndex: -1,
              },
            }}
          >
            {ChatContent}
          </Card>
        </Fade>
      </Slide>
    </>
  );
}
