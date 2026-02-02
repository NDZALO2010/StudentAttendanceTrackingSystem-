import { io, Socket } from 'socket.io-client';
import type { SocketEvents } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const token = localStorage.getItem('token');
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ WebSocket reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('WebSocket disconnected');
    }
  }

  // Join a session room
  joinSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-session', sessionId);
      console.log(`Joined session room: ${sessionId}`);
    }
  }

  // Leave a session room
  leaveSession(sessionId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-session', sessionId);
      console.log(`Left session room: ${sessionId}`);
    }
  }

  // Listen for session started event
  onSessionStarted(callback: SocketEvents['session-started']): void {
    if (this.socket) {
      this.socket.on('session-started', callback);
    }
  }

  // Listen for session ended event
  onSessionEnded(callback: SocketEvents['session-ended']): void {
    if (this.socket) {
      this.socket.on('session-ended', callback);
    }
  }

  // Listen for student checked in event
  onStudentCheckedIn(callback: SocketEvents['student-checked-in']): void {
    if (this.socket) {
      this.socket.on('student-checked-in', callback);
    }
  }

  // Listen for attendance updated event
  onAttendanceUpdated(callback: SocketEvents['attendance-updated']): void {
    if (this.socket) {
      this.socket.on('attendance-updated', callback);
    }
  }

  // Remove event listener
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new WebSocketService();
