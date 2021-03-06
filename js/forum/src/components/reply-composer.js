import ItemList from 'flarum/utils/item-list';
import ComposerBody from 'flarum/components/composer-body';
import Alert from 'flarum/components/alert';
import ActionButton from 'flarum/components/action-button';
import Composer from 'flarum/components/composer';

export default class ReplyComposer extends ComposerBody {
  constructor(props) {
    props.placeholder = props.placeholder || 'Write your reply...';
    props.submitLabel = props.submitLabel || 'Post Reply';
    props.confirmExit = props.confirmExit || 'You have not posted your reply. Do you wish to discard it?';

    super(props);
  }

  view() {
    return super.view('reply-composer');
  }

  headerItems() {
    var items = new ItemList();

    if (app.composer.position() === Composer.PositionEnum.MINIMIZED ||
      // https://github.com/babel/babel/issues/1150
      !app.current.discussion ||
      app.current.discussion() !== this.props.discussion) {
      items.add('title', m('h3', [
        'Replying to ',
        m('a', {href: app.route.discussion(this.props.discussion), config: m.route}, this.props.discussion.title())
      ]));
    }

    return items;
  }

  data() {
    return {
      content: this.content(),
      links: {discussion: this.props.discussion}
    };
  }

  onsubmit() {
    var discussion = this.props.discussion;

    this.loading(true);
    m.redraw();

    var data = this.data();

    app.store.createRecord('posts').save(data).then((post) => {
      app.composer.hide();

      discussion.pushData({
        links: {
          lastUser: post.user(),
          lastPost: post
        },
        lastTime: post.time(),
        lastPostNumber: post.number(),
        commentsCount: discussion.commentsCount() + 1,
        readTime: post.time(),
        readNumber: post.number()
      });
      discussion.data().links.posts.linkage.push({type: 'posts', id: post.id()});

      // If we're currently viewing the discussion which this reply was made
      // in, then we can add the post to the end of the post stream.
      if (app.current && app.current.discussion && app.current.discussion().id() === discussion.id()) {
        app.current.stream().addPostToEnd(post);
        m.route(app.route('discussion.near', {
          id: discussion.id(),
          slug: discussion.slug(),
          near: post.number()
        }));
      } else {
        // Otherwise, we'll create an alert message to inform the user that
        // their reply has been posted, containing a button which will
        // transition to their new post when clicked.
        var alert;
        var viewButton = ActionButton.component({
          label: 'View',
          onclick: () => {
            m.route(app.route('discussion.near', { id: discussion.id(), slug: discussion.slug(), near: post.number() }));
            app.alerts.dismiss(alert);
          }
        });
        app.alerts.show(
          alert = new Alert({
            type: 'success',
            message: 'Your reply was posted.',
            controls: [viewButton]
          })
        );
      }
    }, errors => {
      this.loading(false);
      m.redraw();
      app.handleApiErrors(errors);
    });
  }
}
