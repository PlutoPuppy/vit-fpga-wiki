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
    collection('Gantt schedule', 'schedule', [field('Title', 'title'), field('Owner', 'owner'), field('Workstream', 'group', 'select', { options: ['Baseline and profiling','Hardware development','Software and peripherals','System integration and testing','Milestones'] }), field('Kind', 'kind', 'select', { options: ['task','milestone'] }), field('Start month (1=Sep 2026, 8=Apr 2027)', 'startMonth', 'number', {value_type:'int',min:1,max:8}), field('End month', 'endMonth', 'number', {value_type:'int',min:1,max:8})]),
    collection('Member updates', 'updates', [field('Title', 'title'), field('Date', 'date', 'datetime', { format: 'YYYY-MM-DD', time_format: false }), field('Member', 'memberId', 'relation', { collection: 'members', search_fields: ['name'], display_fields: ['name'], value_field: '{{slug}}' }), field('Update, blockers and next step', 'update', 'text'), field('Evidence links', 'links', 'list', { required: false, fields: [field('Label', 'label'), field('URL', 'url')] })]),
    collection('ECE496 files and data', 'files', [field('Title', 'title'), field('Date', 'date', 'datetime', { format: 'YYYY-MM-DD', time_format: false }), field('Owner', 'owner'), field('Submission / version status', 'status'), field('File or shared URL', 'url', 'file'), field('Description / reproduction details', 'description', 'text', { required: false })]),
    collection('Team members', 'members', [
      field('Name', 'name'), field('Role', 'role'), field('Initials', 'avatar', 'string', { required: false }),
      field('Color', 'color', 'string', { required: false }), field('Research notes', 'notes', 'text', { required: false })
    ], 'name'),
    collection('Tasks', 'tasks', [
      field('Task', 'title'),
      field('Member', 'memberId', 'relation', { collection: 'members', search_fields: ['name'], display_fields: ['name'], value_field: '{{slug}}' }),
      field('Status', 'status', 'select', { options: [{ label: 'To Do', value: 'todo' }, { label: 'In Progress', value: 'in-progress' }, { label: 'Done', value: 'done' }] }),
      field('Category', 'tag', 'string', { required: false }), field('Acceptance criteria / evidence', 'acceptance', 'text', { required: false }), field('Archived', 'archived', 'boolean', { default: false, required: false })
    ]),
    collection('Ideas', 'ideas', [
      field('Title', 'title'), field('Description', 'description', 'text'), field('Author', 'author'),
      field('Category', 'tag'), field('Votes', 'votes', 'number', { value_type: 'int', min: 0, default: 0 }),
      field('Pinned', 'pinned', 'boolean', { default: false })
    ]),
    collection('Meetings', 'meetings', [field('Meeting type', 'type', 'select', { options: [{ label: 'Professor meeting', value: 'professor' }, { label: 'Internal meeting', value: 'internal' }] }),
      field('Title', 'title'), field('Date', 'date', 'datetime', { format: 'YYYY-MM-DD', time_format: false }),
      field('Time', 'time', 'string', { required: false }), field('Time zone', 'timezone', 'string', { required: false }), field('Recurrence', 'recurrence', 'string', { required: false }), field('Notes and decisions', 'notes', 'text', { required: false }), textList('Attendees', 'attendees'),
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
