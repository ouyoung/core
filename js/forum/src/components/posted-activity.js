import Component from 'flarum/component';
import humanTime from 'flarum/helpers/human-time';
import avatar from 'flarum/helpers/avatar';
import listItems from 'flarum/helpers/list-items';
import ItemList from 'flarum/utils/item-list';

export default class PostedActivity extends Component {
  view() {
    var activity = this.props.activity;
    var user = activity.user();
    var post = activity.subject();
    var discussion = post.discussion();

    return m('div', [
      avatar(user, {className: 'activity-icon'}),
      m('div.activity-info', [
        m('strong', post.number() == 1 ? 'Started a discussion' : 'Posted a reply'),
        humanTime(activity.time())
      ]),
      m('a.activity-content.post-activity', {href: app.route('discussion.near', {
        id: discussion.id(),
        slug: discussion.slug(),
        near: post.number()
      }), config: m.route}, [
        m('ul.list-inline', listItems(this.headerItems().toArray())),
        m('div.body', m.trust(post.excerpt()))
      ])
    ]);
  }

  headerItems() {
    var items = new ItemList();

    items.add('title', m('h3.title', this.props.activity.subject().discussion().title()));

    return items;
  }
}
