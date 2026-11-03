const hidden = name => ({ label: name, name, widget: 'hidden', required: false });
const field = (label, name, widget = 'string', options = {}) => ({ label, name, widget, ...options });
const textList = (label, name) => field(label, name, 'list', { required: false });
const collection = (label, name, fields, identifier = 'title') => ({
  label, name, folder: `content/${name}`, create: true, extension: 'json', format: 'json',
  identifier_field: identifier, slug: '{{slug}}', summary: `{{${identifier}}}`, fields: [...fields, hidden('id'), hidden('createdAt'), hidden('updatedAt')]
});

window.initCMS({ config: {
  load_config_file: false,
  backend: {
    name: 'github', repo: 'PlutoPuppy/vit-fpga-wiki', branch: 'main',
    auth_scope: 'public_repo', base_url: location.origin, auth_endpoint: 'api/auth'
  },
  media_folder: 'assets/uploads', public_folder: '/assets/uploads',
  collections: [
    collection('Team members', 'members', [
      field('Name', 'name'), field('Role', 'role'), field('Initials', 'avatar', 'string', { required: false }),
      field('Color', 'color', 'string', { required: false }), field('Research notes', 'notes', 'text', { required: false })
    ], 'name'),
    collection('Tasks', 'tasks', [
      field('Task', 'title'),
      field('Member', 'memberId', 'relation', { collection: 'members', search_fields: ['name'], display_fields: ['name'], value_field: '{{slug}}' }),
      field('Status', 'status', 'select', { options: [{ label: 'To Do', value: 'todo' }, { label: 'In Progress', value: 'in-progress' }, { label: 'Done', value: 'done' }] }),
      field('Category', 'tag', 'string', { required: false })
    ]),
    collection('Ideas', 'ideas', [
      field('Title', 'title'), field('Description', 'description', 'text'), field('Author', 'author'),
      field('Category', 'tag'), field('Votes', 'votes', 'number', { value_type: 'int', min: 0, default: 0 }),
      field('Pinned', 'pinned', 'boolean', { default: false })
    ]),
    collection('Meetings', 'meetings', [
      field('Title', 'title'), field('Date', 'date', 'datetime', { format: 'YYYY-MM-DD', time_format: false }),
      field('Notes', 'notes', 'text', { required: false }), textList('Attendees', 'attendees'),
      textList('Action items', 'actionItems')
    ]),
    collection('Research resources', 'resources', [
      field('Title', 'title'), field('Type', 'type'), field('URL', 'url'),
      field('Authors', 'authors', 'string', { required: false }), field('Year', 'year', 'string', { required: false }),
      field('Venue', 'venue', 'string', { required: false }), field('Description', 'description', 'text', { required: false }),
      field('Citations', 'citations', 'number', { required: false, value_type: 'int', min: 0 }), textList('Tags', 'tags')
    ])
  ]
}});
