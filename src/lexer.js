'use strict';

// Enumeration describing valid PATTERNS keys to break up stringly-typed interfacing
// with patterns by letting linters spot invalid enum values rather than using Strings
// that are opaque to linting.
const TokenType = {
  END_OF_INPUT: 'END_OF_INPUT',
  TEXT: 'TEXT',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  LEFT_PAREN: 'LEFT_PAREN',
  RIGHT_PAREN: 'RIGHT_PAREN',
  EQ: 'EQ',
  EQ_OR_ASSIGN: 'EQ_OR_ASSIGN',
  NEQ: 'NEQ',
  GTE: 'GTE',
  GT: 'GT',
  LTE: 'LTE',
  LT: 'LT',
  ADD_ASSIGN: 'ADD_ASSIGN',
  SUBTRACT_ASSIGN: 'SUBTRACT_ASSIGN',
  MULTIPLY_ASSIGN: 'MULTIPLY_ASSIGN',
  DIVIDE_ASSIGN: 'DIVIDE_ASSIGN',
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
  AND: 'AND',
  OR: 'OR',
  XOR: 'XOR',
  NOT: 'NOT',
  COMMA: 'COMMA',
  VARIABLE: 'VARIABLE',
  TRUE: 'TRUE',
  FALSE: 'FALSE',
  NULL: 'NULL',
  COMMAND_BEGIN: 'COMMAND_BEGIN',
  COMMAND_END: 'COMMAND_END',
  OPTION_BEGIN: 'OPTION_BEGIN',
  OPTION_END: 'OPTION_END',
  OPTION_DELIMIT: 'OPTION_DELIMIT',
  IDENTIFIER: 'IDENTIFIER',
  IF: 'IF',
  ELSE: 'ELSE',
  ELSE_IF: 'ELSE_IF',
  END_IF: 'END_IF',
  SET: 'SET',
  SHORTCUT_OPTION: 'SHORTCUT_OPTION'
};

// Map of PatternTypes to regex patterns.
const PATTERNS = {
  TEXT: /.*/i
  NUMBER: /\-?[0-9]+(\.[0-9+])?/i,
  STRING: /""([^""\\]*(?:\\.[^""\\]*)*)""/i,
  LEFT_PAREN: /\(/i,
  RIGHT_PAREN: /\)/i,
  EQ: /(==|is(?!\w)|eq(?!\w))/i,
  EQ_OR_ASSIGN: /(=|to(?!\w))/i,
  NEQ: /(\!=|neq(?!\w))/i,
  GTE: /(\>=|gte(?!\w))/i,
  GT: /(\>|gt(?!\w))/i,
  LTE: /(\<=|lte(?!\w))/i,
  LT: /(\<|lt(?!\w))/i,
  ADD_ASSIGN: /\+=/i,
  SUBTRACT_ASSIGN: /\-=/i,
  MULTIPLY_ASSIGN: /\*=/i,
  DIVIDE_ASSIGN: /\/=/i,
  ADD: /\+/i,
  SUBTRACT: /\-/i,
  MULTIPLY: /\*/i,
  DIVIDE: /\//i,
  AND: /(\&\&|and(?!\w))/i,
  OR: /(\|\||or(?!\w))/i,
  XOR: /(\^|xor(?!\w))/i,
  NOT: /(\!|not(?!\w))/i,
  COMMA: /,/i,
  VARIABLE: /\$([A-Za-z0-9_\.])+/i,
  TRUE: /true(?!\w)/i,
  FALSE: /false(?!\w)/i,
  NULL: /null(?!\w)/i,
  COMMAND_BEGIN: /\<\</i,
  COMMAND_END: /\>\>/i,
  OPTION_BEGIN: /\[\[/i,
  OPTION_END: /\]\]/i,
  OPTION_DELIMIT: /\|/i,
  IDENTIFIER: /[a-zA-Z0-9_:\.]+/i,
  IF: /if(?!\w)/i,
  ELSE: /else(?!\w)/i,
  ELSE_IF: /elseif(?!\w)/i,
  END_IF: /endif(?!\w)/i,
  SET: /set(?!\w)/i,
  SHORTCUT_OPTION: /@"\-\>/i
}

// Enumeration describing valid STATES keys to break up stringly-typed interfacing
// with states by letting linters spot invalid enum values rather than using Strings
// that are opaque to linting.
const StateType = {
  BASE: 'BASE',
  SHORTCUT_OPTION: 'SHORTCUT_OPTION',
  COMMAND: 'COMMAND',
  COMMARD_OR_EXPRESSION: 'COMMAND_OR_EXPRESSION',
  ASSIGNMENT: 'ASSIGNMENT',
  EXPRESSION: 'EXPRESSION',
  LINK: 'LINK',
  LINK_DESTINATION: 'LINK_DESTINATION'
}

// Map of StateTypes to LexerStates.
const STATES = {
  BASE: new LexerState( false )
    .addTransition( TokenType.COMMAND_BEGIN, StateType.COMMAND, true )
    .addTransition( TokenType.OPTION_BEGIN, StateType.LINK, true )
    .addTransition( TokenType.SHORTCUT_OPTION, StateType.SHORTCUT_OPTION )
    .addTextRule( TokenType.TEXT ),
  SHORTCUT_OPTION: new LexerState( true ) // setTrackNextIndentation = true
    .addTransition( TokenType.COMMAND_BEGIN, StateType.EXPRESSION, true )
    .addTextRule( TokenType.TEXT, StateType.BASE ),
  COMMAND: new LexerState( false )
    .addTransition( TokenType.IF, StateType.EXPRESSION )
    .addTransition( TokenType.ELSE )
    .addTransition( TokenType.ELSE_IF, StateType.EXPRESSION )
    .addTransition( TokenType.END_IF )
    .addTransition( TokenType.SET, StateType.ASSIGNMENT )
    .addTransition( TokenType.COMMAND_END, StateType.BASE, true )
    .addTransition( TokenType.IDENTIFIER, StateType.COMMAND_OR_EXPRESSION )
    .addTextRule( TokenType.TEXT ),
  ASSIGNMENT: new LexerState( false )
    .addTransition( TokenType.VARIABLE )
    .addTransition( TokenType.EQ_OR_ASSIGN, StateType.EXPRESSION )
    .addTransition( TokenType.ADD_ASSIGN, StateType.EXPRESSION )
    .addTransition( TokenType.SUBTRACT_ASSIGN, StateType.EXPRESSION )
    .addTransition( TokenType.MULTIPLY_ASSIGN, StateType.EXPRESSION )
    .addTransition( TokenType.DIVIDE_ASSIGN, StateType.EXPRESSION ),
  EXPRESSION: new LexerState( false )
    .addTransition( TokenType.COMMAND_END, StateType.BASE )
    .addTransition( TokenType.NUMBER )
    .addTransition( TokenType.STRING )
    .addTransition( TokenType.LEFT_PAREN )
    .addTransition( TokenType.RIGHT_PAREN )
    .addTransition( TokenType.EQ )
    .addTransition( TokenType.EQ_OR_ASSIGN )
    .addTransition( TokenType.NEQ )
    .addTransition( TokenType.GTE )
    .addTransition( TokenType.GT )
    .addTransition( TokenType.LTE )
    .addTransition( TokenType.LT )
    .addTransition( TokenType.ADD )
    .addTransition( TokenType.SUBTRACT )
    .addTransition( TokenType.MULTIPLY )
    .addTransition( TokenType.DIVIDE )
    .addTransition( TokenType.AND )
    .addTransition( TokenType.OR )
    .addTransition( TokenType.XOR )
    .addTransition( TokenType.NOT )
    .addTransition( TokenType.VARIABLE )
    .addTransition( TokenType.COMMA )
    .addTransition( TokenType.TRUE )
    .addTransition( TokenType.FALSE )
    .addTransition( TokenType.NULL )
    .addTransition( TokenType.IDENTIFIER ),
  LINK: new LexerState( false )
    .addTransition( TokenType.OPTION_END, StateType.BASE, true )
    .addTransition( TokenType.OPTION_DELIMIT, StateType.LINK_DESTINATION, true )
    .addTextRule( TokenType.TEXT ),
  LINK_DESTINATION: new LexerState( false )
    .addTransition( TokenType.IDENTIFIER )
    .addTransition( TokenType.OPTION_END, StateType.BASE )
}

const DEFAULT_STATE = StateType.BASE;

const LINE_COMMENT = '//';

const LEX_EOF = 'EOF';

const LEX_INVALID = 'INVALID';

class Token {
  constructor( tokenType, lineNumber = -1, columnNumber = -1, value = null ) {
    this.type = tokenType;
    this.value = value;
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;

    this.parameterCount = 0;
    this.delimitsText = false;
    this.context = null;
  }
  toString() {
    return ( this.value != null ) ?
      `${this.type} (${this.value}) at ${this.lineNumber}:${this.columnNumber}` :
      `${this.type} at ${this.lineNumber}:${this.columnNumber}`;
  }
}

class TokenRule {
  constructor( tokenType, regex, entersStateType = null, delimitsText = false, isTextRule = false ) {
    this.type = tokenType;
    this.regex = regex;
    this.entersState = entersState;
    this.delimitsText = delimitsText;
    this.isTextRule = isTextRule;
  }
  toString() {
    return `[TokenRule: ${this.type} - ${this.regex}]`;
  }
}

class TokenizerError extends Error {
  contructor( message, lineNumber = -1, columnNumber = -1 ) {
    const superMessage = ( lineNumber > -1 )
      ? `${message}:${lineNumber}:${columnNumber}`
      : message;
    super( superMessage );
    this.lineNumber = lineNumber;
    this.columnNumber = columnNumber;
  }
  static expectedTokensFromState = function ( lineNumber, columnNumber, lexerState ) {
    const names = state
      .tokenRules
      .map( rule => rule.type );
    const lastName = names.pop();
    const namesString = ( names.length >= 1 ) ?
      names.join( ', ' ) + ' or '
    lastName;: lastName;
    return new TokenizerError( lineNumber, columnNumber, `Expected ${namesString}` );
  }
}

class LexerState {
  constructor( setTrackNextIndentation = false ) {
    this.setTrackNextIndentation = setTrackNextIndentation;
    this.tokenRules = [];
  }
  containsTextRule() {
    const textRules = this
      .tokenRules
      .filter( rule => rule.isTextRule );
    return ( textRules.length > 0 );
  }
  addTransition( tokenType, entersStateType = null, delimitsText = false, isTextRule = false, regex = null ) {
    regex = regex || new RegExp( `\G${ PATTERNS[ tokenType ] }` );
    this
      .tokenRules
      .push( new TokenRule( tokenType, regex, entersStateType, delimitsText, isTextRule ) );
    return this; // Return this for chaining.
  }
  addTextRule( tokenType, entersStateType = null ) {
    if ( this.containsTextRule() ) {
      throw new Error( 'Cannot add more than one text rule.' );
    }

    // Go through the regex of the other transitions in this state, and create a regex that will
    // match all text, up to any of those transitions.
    const rules = this
      .tokenRules
      .filter( rule => rule.delimitsText )
      .map( rule => `(${ rule.regex.source.substring( 2 ) })` );

    // Join the rules that we got above on a | and put them all into a negative lookahead to
    // exclude any of the delimiter rules.
    const regex = new RegExp = new RegExp( `\G((?!${ rules.join( '|' ) }).)*` );

    // Create the transition that we've worked so hard to prepare!
    this.addTransition( TokenType.TEXT, entersStateType, false, regex );

    return this; // Return this for chaining.
  }
}

class Lexer {
  constructor( text = '' ) {
    this.setInput( text );
  }
  setInput( text ) {
    this.text = text;
    // Make sure the Lexer state is reset before we try to tokenize again.
    this.reset();
  }
  reset() {
    this.currentState = DEFAULT_STATE;
    this.shouldTrackNextIndentation = false;
    this.indentationStack = [ [ 0, false ] ];
    // Variables for jison to make use of
    this.yytext = '';
    this.yylloc = {
      first_column: 0,
      first_line: 1,
      last_column: 0,
      last_line: 1,
    };
    this.yylineno = 0;
  }
  lex() {
    if ( this.text === '' ) {
      return LEX_EOF; // Out of tokens to lex
    }

    for ( const rule of STATES[ this.currentState ].tokenRules ) {
      // Only accept valid matches that are at the beginning of the text
      const match = this.text.match( rule.regex );
      if ( match === null || match.index !== 0 ) {
        continue;
      }

      // Take the matched text off the front of this.text
      const matchedText = match[ 0 ];
      this.text = this.text.substr( matchedText.length );

      // Tell the parser what the text for this token is
      this.yytext = matchedText;

      // Update our line and column info
      if ( rule.type === TokenType.NEWLINE ) {
        this.yylloc.last_line = this.yylloc.first_line;
        this.yylloc.first_line++;
        this.yylloc.first_column = 0;
        this.yylineno++;
      }
      else {
        this.yylloc.last_column = this.yylloc.first_column;
        this.yylloc.first_column += matchedText.length;
      }

      // If the rule points to a new state, change it now
      if ( rule.entersState ) {
        this.enterState( rule.entersState );
      }

      return rule.type;
    }

    return LEX_INVALID;
  }

  tokenize( text ) {

    const lines = this
      .text
      .split( '\n' );
    lines.push( '' );

    let lineNumber = 0;
    const tokens = lines
      .reduce( line => ( carry, line, i ) => {
        lineNumber = i + 1;
        return carry.concat( this.tokenizeLine( line, lineNumber ) );
      }, [] );
    tokens.push( new Token( TokenType.END_OF_INPUT, lineNumber, 0 ) );

    return tokens;
  }
  tokenizeLine( line, lineNumber ) {

  }

  enterState( lexerState ) {
    this.currentState = lexerState;
    if ( this.currentState.setTrackNextIndentation ) {
      this.shouldTrackNextIndentation = true;
    }
  }
  getLineIndentation( line ) {
    const matches = line.match( /^(\s*)/i );
    // FIXME: Not sure about getting the group I matched here!
    return ( matches != null && matches[ 1 ] != null )
      ? matches[ 1 ].length
      : 0;
    }
  }
}

module.exports = Lexer;
