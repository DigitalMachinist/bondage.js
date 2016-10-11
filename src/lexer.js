'use strict';

const tokens = {
  TEXT: /.*/,

  // Things like function names, node names, etc
  IDENTIFIER: /[A-Za-z0-9_]+/,

  NEWLINE: /\n/,

  OPTSTART: /\[\[/,
  OPTEND: /\]\]/,
  OPTSEP: /\|/,

  CMDSTART: /<</,
  CMDEND: />>/,

  STOP: /[Ss][Tt][Oo][Pp]/,

  SET: /[Ss][Ee][Tt]/,
  VARIABLE: /\$[A-Za-z0-9_]+/,
  TO: /[Tt][Oo]|=/,
  STRING: /".*?"|'.*?'/,
  NUMBER: /[0-9]+\.?[0-9]*/,
  BOOLEAN: /TRUE|true|FALSE|false/,
  NULL: /null/,

  IFSTART: /[Ii][Ff]/,
  IFEND: /[Ee][Nn][Dd][Ii][Ff]/,
  IS: /[Ii][Ss]|==/,
  ISNT: /[Ii][Ss] [Nn][Oo][Tt]|!=/,
  OR: /[Oo][Rr]|\|\|/,
  AND: /[Aa][Nn][Dd]|\&\&/,
  GT: />/,
  GTE: />=/,
  LT:  /</,
  LTE: /<=/
};

class LexState {
  constructor() {
    this.transitions = [];
    this.textRule = null;
  }

  addTransition(token, state, delimitsText) {
    this.transitions.push({
      token: token,
      regex: tokens[token],
      state: state || null,
      delimitsText: delimitsText || false,
    });

    return this; // Return this for chaining
  }

  /**
   * A text rule matches all the way up to any of the other transitions in this state
   */
  addTextRule(state) {
    if (this.textRule) {
      throw Error('Cannot add more than one text rule');
    }

    // Go through the regex of the other transitions in this state, and create a regex that will
    // match all text, up to any of those transitions
    const rules = [];
    for (const trans of this.transitions) {
      if (trans.delimitsText) {
        // Surround the rule in parens
        rules.push(`(${trans.regex.source})`);
      }
    }

    // Join the rules that we got above on a |, then put them all into a negative lookahead
    const textPattern = `((?!${rules.join('|')}).)*`;

    this.addTransition('TEXT', state);

    // Update the regex in the transition we just added to our new one
    this.textRule = this.transitions[this.transitions.length - 1];
    this.textRule.regex = new RegExp(textPattern);

    return this; // Return this for chaining
  }
}

class Lexer {
  constructor() {
    this.text = '';

    this.states = {
      base: new LexState().addTransition('OPTSTART', 'option', true)
                          .addTransition('CMDSTART', 'command', true)
                          .addTransition('NEWLINE')
                          .addTextRule(),

      option: new LexState().addTransition('OPTEND', 'base', true)
                            .addTransition('OPTSEP', 'optiondest', true)
                            .addTextRule(),

      optiondest: new LexState().addTransition('OPTEND', 'base')
                                .addTransition('IDENTIFIER'),

      command: new LexState().addTransition('CMDEND', 'base', true)
                             .addTextRule(),
    };

    this.state = 'base';

    this.reset();
  }

  reset() {
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

  setInput(text) {
    this.text = text;
    this.reset();
  }

  lex() {
    if (this.text === '') {
      // Out of tokens to lex
      return 'EOF';
    }

    for (const rule of this.states[this.state].transitions) {
      const match = this.text.match(rule.regex);

      // Only accept valid matches that are at the beginning of the text
      if (match === null || match.index !== 0) continue;

      // Take the matched text off the front of this.text
      const matchedText = match[0];
      this.text = this.text.substr(matchedText.length);

      // Tell the parser what the text for this token is
      this.yytext = matchedText;

      // Update our line and column info
      if (rule.token === 'NEWLINE') {
        this.yylloc.last_line = this.yylloc.first_line;
        this.yylloc.first_line++;
        this.yylloc.first_column = 0;
        this.yylineno++;
      } else {
        this.yylloc.last_column = this.yylloc.first_column;
        this.yylloc.first_column += matchedText.length;
      }

      // If the rule points to a new state, change it now
      if (rule.state) {
        this.changeState(rule.state);
      }

      return rule.token;
    }

    return 'INVALID';
  }

  changeState(state) {
    this.state = state;
  }
}

module.exports = Lexer;
