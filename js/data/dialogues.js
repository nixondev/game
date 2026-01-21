(function(){
  'use strict';

  // Simple dialogue database with branching
  // Node format: { id, text, choices: [ { text, next, effects: [] } ] }
  // 'next' refers to another node id in the same dialogue; if omitted and no choices, dialogue ends.
  window.DialogueDB = {
    introVillager: {
      id: 'introVillager',
      start: 'n1',
      nodes: {
        n1: { id: 'n1', text: 'Hello, traveler! Welcome to our fields.' , choices: [
          { text: 'Thanks! Any advice?', next: 'n2' },
          { text: 'Got any work for me?', next: 'n3' }
        ]},
        n2: { id: 'n2', text: 'Watch out for the hedges. Paths can be tricky.', choices: [
          { text: 'Got it, thanks.', effects: [] }
        ]},
        n3: { id: 'n3', text: 'You look eager. Want a simple task?', choices: [
          { text: 'Yes, give me a quest.', effects: [{ type:'startQuest', id:'firstSteps' }] },
          { text: 'Maybe later.' }
        ]}
      }
    }
  };
})();
