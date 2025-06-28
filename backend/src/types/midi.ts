/**
 * MIDI Data Schema Definitions for Phase 5.2
 * 
 * This file defines the structure for MIDI notes and segments content
 * to be stored in the StemSegment.content JSON field when type = 'MIDI'
 */

/**
 * A single MIDI note with timing, pitch, velocity, and optional channel information
 */
export interface MidiNote {
  /** Unique identifier for the note within the segment */
  id: string;
  
  /** Start time of the note in milliseconds from segment start */
  start: number;
  
  /** Duration of the note in milliseconds */
  duration: number;
  
  /** MIDI pitch value (0-127) */
  pitch: number;
  
  /** Note velocity (0-127) */
  velocity: number;
  
  /** MIDI channel (0-15), optional - defaults to 0 */
  channel?: number;
}

/**
 * MIDI segment content structure for storing in StemSegment.content field
 */
export interface MidiSegmentContent {
  /** Content type identifier */
  type: 'midi';
  
  /** Array of MIDI notes in this segment */
  notes: MidiNote[];
  
  /** MIDI program change (instrument) if specified (0-127) */
  program?: number;
  
  /** MIDI bank select if specified (0-16383) */
  bank?: number;
  
  /** Key signature for display purposes */
  keySignature?: {
    key: number; // -7 to 7 (C major = 0)
    mode: 'major' | 'minor';
  };
  
  /** Time signature for this segment */
  timeSignature?: {
    numerator: number;
    denominator: number;
  };
  
  /** Additional metadata */
  metadata?: {
    /** Original MIDI file name if imported */
    originalFileName?: string;
    
    /** Quantization grid if applied */
    quantization?: number; // in milliseconds
    
    /** Swing percentage if applied (0-100) */
    swing?: number;
  };
}

/**
 * Validation constraints for MIDI data
 */
export const MIDI_CONSTRAINTS = {
  /** Valid MIDI pitch range */
  PITCH: {
    MIN: 0,
    MAX: 127
  },
  
  /** Valid MIDI velocity range */
  VELOCITY: {
    MIN: 0,
    MAX: 127
  },
  
  /** Valid MIDI channel range */
  CHANNEL: {
    MIN: 0,
    MAX: 15
  },
  
  /** Valid MIDI program range */
  PROGRAM: {
    MIN: 0,
    MAX: 127
  },
  
  /** Valid MIDI bank range */
  BANK: {
    MIN: 0,
    MAX: 16383
  },
  
  /** Maximum number of notes per segment */
  MAX_NOTES_PER_SEGMENT: 10000,
  
  /** Minimum note duration in milliseconds */
  MIN_NOTE_DURATION: 1,
  
  /** Maximum note duration in milliseconds (5 minutes) */
  MAX_NOTE_DURATION: 300000
} as const;

/**
 * Utility functions for MIDI data validation
 */
export class MidiValidator {
  /**
   * Validate a MIDI note
   */
  static validateNote(note: MidiNote): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!note.id || typeof note.id !== 'string') {
      errors.push('Note ID is required and must be a string');
    }
    
    if (typeof note.start !== 'number' || note.start < 0) {
      errors.push('Note start time must be a non-negative number');
    }
    
    if (typeof note.duration !== 'number' || 
        note.duration < MIDI_CONSTRAINTS.MIN_NOTE_DURATION || 
        note.duration > MIDI_CONSTRAINTS.MAX_NOTE_DURATION) {
      errors.push(`Note duration must be between ${MIDI_CONSTRAINTS.MIN_NOTE_DURATION} and ${MIDI_CONSTRAINTS.MAX_NOTE_DURATION} milliseconds`);
    }
    
    if (typeof note.pitch !== 'number' || 
        note.pitch < MIDI_CONSTRAINTS.PITCH.MIN || 
        note.pitch > MIDI_CONSTRAINTS.PITCH.MAX) {
      errors.push(`Note pitch must be between ${MIDI_CONSTRAINTS.PITCH.MIN} and ${MIDI_CONSTRAINTS.PITCH.MAX}`);
    }
    
    if (typeof note.velocity !== 'number' || 
        note.velocity < MIDI_CONSTRAINTS.VELOCITY.MIN || 
        note.velocity > MIDI_CONSTRAINTS.VELOCITY.MAX) {
      errors.push(`Note velocity must be between ${MIDI_CONSTRAINTS.VELOCITY.MIN} and ${MIDI_CONSTRAINTS.VELOCITY.MAX}`);
    }
    
    if (note.channel !== undefined && 
        (typeof note.channel !== 'number' || 
         note.channel < MIDI_CONSTRAINTS.CHANNEL.MIN || 
         note.channel > MIDI_CONSTRAINTS.CHANNEL.MAX)) {
      errors.push(`Note channel must be between ${MIDI_CONSTRAINTS.CHANNEL.MIN} and ${MIDI_CONSTRAINTS.CHANNEL.MAX}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate MIDI segment content
   */
  static validateSegmentContent(content: MidiSegmentContent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (content.type !== 'midi') {
      errors.push('Content type must be "midi"');
    }
    
    if (!Array.isArray(content.notes)) {
      errors.push('Notes must be an array');
    } else {
      if (content.notes.length > MIDI_CONSTRAINTS.MAX_NOTES_PER_SEGMENT) {
        errors.push(`Too many notes: maximum ${MIDI_CONSTRAINTS.MAX_NOTES_PER_SEGMENT} allowed`);
      }
      
      // Validate each note
      content.notes.forEach((note, index) => {
        const noteValidation = this.validateNote(note);
        if (!noteValidation.valid) {
          errors.push(`Note ${index}: ${noteValidation.errors.join(', ')}`);
        }
      });
      
      // Check for duplicate note IDs
      const noteIds = content.notes.map(note => note.id);
      const duplicateIds = noteIds.filter((id, index) => noteIds.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        errors.push(`Duplicate note IDs found: ${duplicateIds.join(', ')}`);
      }
    }
    
    // Validate optional fields
    if (content.program !== undefined && 
        (typeof content.program !== 'number' || 
         content.program < MIDI_CONSTRAINTS.PROGRAM.MIN || 
         content.program > MIDI_CONSTRAINTS.PROGRAM.MAX)) {
      errors.push(`Program must be between ${MIDI_CONSTRAINTS.PROGRAM.MIN} and ${MIDI_CONSTRAINTS.PROGRAM.MAX}`);
    }
    
    if (content.bank !== undefined && 
        (typeof content.bank !== 'number' || 
         content.bank < MIDI_CONSTRAINTS.BANK.MIN || 
         content.bank > MIDI_CONSTRAINTS.BANK.MAX)) {
      errors.push(`Bank must be between ${MIDI_CONSTRAINTS.BANK.MIN} and ${MIDI_CONSTRAINTS.BANK.MAX}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Create an empty MIDI segment content
   */
  static createEmptySegmentContent(): MidiSegmentContent {
    return {
      type: 'midi',
      notes: []
    };
  }
  
  /**
   * Generate a unique note ID
   */
  static generateNoteId(): string {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
