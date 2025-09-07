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
  Badge
} from '@mui/material';
import { alpha, styled } from '@mui/material/styles';
// icons
import { useAuthContext } from 'src/auth/hooks';
import Iconify from '../iconify';
// hooks
// mock data
import { aiChatMessages, aiSuggestions } from './mock-data';

// ----------------------------------------------------------------------

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  zIndex: theme.zIndex.speedDial,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
  color: theme.palette.common.white,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.info.dark})`,
    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.6)}`,
    transform: 'scale(1.05)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.info.main}, ${theme.palette.success.main})`,
    borderRadius: '50%',
    zIndex: -1,
    animation: 'pulse 2s ease-in-out infinite'
  },
  '@keyframes pulse': {
    '0%': {
      opacity: 1
    },
    '50%': {
      opacity: 0.3
    },
    '100%': {
      opacity: 1
    }
  }
}));

const ChatContainer = styled(Card)(({ theme }) => ({
  position: 'fixed',
  bottom: 100,
  right: 24,
  width: 400,
  height: 600,
  zIndex: theme.zIndex.modal,
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(
    theme.palette.background.default,
    0.95
  )})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`,

  [theme.breakpoints.down('sm')]: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0
  }
}));

const MaximizedChatContainer = styled(Card)(({ theme }) => ({
  position: 'fixed',
  top: 24,
  left: 24,
  right: 24,
  bottom: 24,
  zIndex: theme.zIndex.modal,
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(
    theme.palette.background.default,
    0.95
  )})`,
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.3)}`
}));

const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isBot'
})<{ isBot?: boolean }>(({ theme, isBot }) => ({
  padding: theme.spacing(1.5, 2),
  marginBottom: theme.spacing(1),
  maxWidth: '80%',
  borderRadius: 16,
  ...(isBot
    ? {
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        alignSelf: 'flex-start'
      }
    : {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        alignSelf: 'flex-end',
        marginLeft: 'auto'
      })
}));

const SuggestionChip = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(0.5, 1.5),
  margin: theme.spacing(0.5),
  backgroundColor: alpha(theme.palette.info.main, 0.1),
  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
  borderRadius: 20,
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: theme.palette.info.main,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.info.main, 0.2),
    transform: 'translateY(-2px)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.3)}`
  }
}));

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
      timestamp: new Date()
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
        suggestions: aiResponse.suggestions
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
        suggestions: ['¿Qué productos rotan más lento?', 'Mostrar inventario actual', 'Comparar ventas del mes']
      };
    }

    if (lowerMessage.includes('inventario')) {
      return {
        text: 'Actualmente tienes 1,247 productos en inventario. Los productos con mayor stock son: Camisetas (156 unidades), Pantalones (98 unidades), Zapatos (87 unidades).',
        suggestions: ['¿Cuáles están por agotarse?', 'Productos con menor rotación', 'Valor total del inventario']
      };
    }

    if (lowerMessage.includes('cliente') && lowerMessage.includes('debe')) {
      return {
        text: "El cliente que más te debe actualmente es 'Distribuidora del Norte S.A.S' con un saldo pendiente de $2.850.000 correspondiente a 3 facturas vencidas.",
        suggestions: ['Enviar recordatorio de pago', 'Ver todas las cuentas por cobrar', 'Generar reporte de cartera']
      };
    }

    if (lowerMessage.includes('rotan') && lowerMessage.includes('lento')) {
      return {
        text: 'Los productos con menor rotación son: Chaqueta de Invierno (45 días sin venta) y Zapatos Formales (30 días). Te recomiendo crear una promoción del 20% para acelerar la rotación.',
        suggestions: ['Crear promoción automática', 'Ver análisis de temporada', 'Sugerir descuentos']
      };
    }

    return {
      text: '¡Hola! Soy Ally IA, tu asistente virtual. Puedo ayudarte con consultas sobre ventas, inventario, clientes y generar análisis inteligentes para tu negocio. ¿En qué puedo ayudarte hoy?',
      suggestions: [
        '¿Cuál fue mi mejor producto ayer?',
        '¿Qué productos están por agotarse?',
        'Mostrar resumen de ventas'
      ]
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

  const renderChatHeader = () => (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
        p: 2,
        color: 'common.white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Avatar
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.common.white}, ${alpha(
              theme.palette.primary.light,
              0.8
            )})`,
            color: 'primary.main'
          }}
        >
          <Iconify icon="hugeicons:ai-brain-04" width={24} />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Ally IA
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            Asistente Virtual
          </Typography>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1}>
        {!isMobile && (
          <IconButton onClick={handleMaximize} sx={{ color: 'inherit' }}>
            <Iconify icon={isMaximized ? 'material-symbols:fullscreen-exit' : 'material-symbols:fullscreen'} />
          </IconButton>
        )}
        <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'inherit' }}>
          <Iconify icon="material-symbols:close" />
        </IconButton>
      </Stack>
    </Box>
  );

  const renderTypingIndicator = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: theme.spacing(1, 2),
        '& .dot': {
          width: 8,
          height: 8,
          backgroundColor: 'text.secondary',
          borderRadius: '50%',
          animation: 'typing 1.4s infinite ease-in-out',
          '&:nth-of-type(2)': {
            animationDelay: '0.2s'
          },
          '&:nth-of-type(3)': {
            animationDelay: '0.4s'
          }
        },
        '@keyframes typing': {
          '0%, 60%, 100%': {
            transform: 'scale(0.8)',
            opacity: 0.5
          },
          '30%': {
            transform: 'scale(1)',
            opacity: 1
          }
        }
      }}
    >
      <Typography variant="body2" sx={{ mr: 1 }}>
        Analizando datos
      </Typography>
      <Box className="dot" />
      <Box className="dot" />
      <Box className="dot" />
    </Box>
  );

  const ChatContent = (
    <Stack sx={{ height: '100%' }}>
      {/* Header */}
      {renderChatHeader()}

      {/* Messages */}
      <Stack
        sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: 6
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: alpha(theme.palette.grey[500], 0.1),
            borderRadius: 3
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.grey[500], 0.3),
            borderRadius: 3,
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.5)
            }
          }
        }}
        spacing={1}
      >
        {messages.map((message) => (
          <Box key={message.id}>
            <MessageBubble isBot={message.isBot}>
              {message.isBot && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                    <Iconify icon="hugeicons:ai-brain-04" width={16} />
                  </Avatar>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Ally IA
                  </Typography>
                </Stack>
              )}
              <Typography variant="body2">{message.text}</Typography>
              {message.suggestions && (
                <Box sx={{ mt: 1.5 }}>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {message.suggestions.map((suggestion, index) => (
                      <SuggestionChip key={index} onClick={() => handleSuggestionClick(suggestion)}>
                        <Typography variant="caption">{suggestion}</Typography>
                      </SuggestionChip>
                    ))}
                  </Stack>
                </Box>
              )}
            </MessageBubble>
          </Box>
        ))}

        {isTyping && (
          <MessageBubble isBot>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                <Iconify icon="hugeicons:ai-brain-04" width={16} />
              </Avatar>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                Ally IA
              </Typography>
            </Stack>
            {renderTypingIndicator()}
          </MessageBubble>
        )}

        <Box ref={messagesEndRef} />
      </Stack>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pregúntame sobre tu negocio..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          InputProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.3)
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.5)
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main
              }
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim()}
                  sx={{
                    color: theme.palette.primary.main,
                    '&:disabled': {
                      color: theme.palette.text.disabled
                    }
                  }}
                >
                  <Iconify icon="material-symbols:send" />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        {/* Quick suggestions */}
        <Box sx={{ mt: 1 }}>
          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {aiSuggestions.map((suggestion, index) => (
              <SuggestionChip key={index} onClick={() => handleSuggestionClick(suggestion)}>
                <Typography variant="caption">{suggestion}</Typography>
              </SuggestionChip>
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
        badgeContent={hasNewMessage ? '!' : null}
        color="error"
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
      >
        <StyledFab onClick={handleToggleChat}>
          <Iconify icon="hugeicons:ai-brain-04" width={32} />
        </StyledFab>
      </Badge>

      {/* Chat Window */}
      <Backdrop
        open={isOpen}
        onClick={() => setIsOpen(false)}
        sx={{
          zIndex: (theme) => theme.zIndex.modal - 1,
          backgroundColor: alpha(theme.palette.common.black, 0.3)
        }}
      />

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        {isMaximized && !isMobile ? (
          <MaximizedChatContainer onClick={(e) => e.stopPropagation()}>{ChatContent}</MaximizedChatContainer>
        ) : (
          <ChatContainer onClick={(e) => e.stopPropagation()}>{ChatContent}</ChatContainer>
        )}
      </Slide>
    </>
  );
}
