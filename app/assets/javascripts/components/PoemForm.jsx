export default class PoemForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      description: props.description,
      description_html: props.description_html
    };
  }

  componentDidMount(){
    require('jquery-textcomplete')
    $(this.refs.textarea).textcomplete([
      { // emoji strategy
        match: /\B:([\-+\w]*)$/,
        search(term, callback) {
          return $.getJSON("/api/emoji", {
            query: term
          }).done(function(data) {
            return callback(data)
          }).fail(function() {
            return callback([])
          })
        },
        template(data) {
          return `<img src="${data.url}" class="emoji"></img> ${data.value}`;
        },
        replace(data) {
          return `:${data.value}:`;
        },
        index: 1
      }
    ], {
      onKeydown(e, commands) {
        if (e.ctrlKey && e.keyCode === 74) { // CTRL-J
          return commands.KEY_ENTER;
        }
      }
    })
    .on({
      // 候補から選択してもonChangeイベントが発火しないので、
      // 強制的にonChangeさせる
      'textComplete:select': (e, value, strategy) => {
        this.onDescriptionChange(e)
      }
    })
  }

  onTitleChange(event) {
    this.setState({ title: event.target.value })
  }

  onDescriptionChange(event) {
    this.setState({ description: event.target.value })
    setTimeout( ()=>{ this.createPreview() }, 1000 )
  }

  rawMarkup() {
    return { __html: this.state.description_html };
  }

  createPreview() {
    $.post(
      '/api/markdown_previews',
      { text: this.state.description },
      'html'
    ).done( (data) => {
      this.setState({ description_html: data })
    })
  }

  render () {
    return (
      <div className="row">
        <div className="col-sm-6 panel panel-default poem-form">
          <div className="panel-body">
            <div className="form-group string required poem_title">
              <label className="string required control-label" htmlFor="poem_title">
                <abbr title="required">*</abbr> タイトル</label>
              <input className="string required form-control" onChange={this.onTitleChange.bind(this)}
                id="title" type="text" name="poem[title]" value={this.state.title}/>
            </div>
            <div className="form-group text required poem_description">
              <label className="text required control-label" htmlFor="poem_description">
                <abbr title="required">*</abbr> 本文</label>
              <textarea className="text required form-control"
                rows="10" onChange={this.onDescriptionChange.bind(this)}
                id="description" name="poem[description]"
                value={this.state.description} ref="textarea"></textarea>
            </div>
          </div>
        </div>
        <div className="col-sm-6 panel panel-default poem-preview">
          <div className="panel-body">
            <div className="page-header">
              <h3>{this.state.title}</h3>
            </div>
            <div className="poem-area" dangerouslySetInnerHTML={this.rawMarkup()} />
          </div>
        </div>
      </div>
    );
  }
}

PoemForm.propTypes = {
  title: React.PropTypes.string,
  description: React.PropTypes.string,
  description_html: React.PropTypes.string
};
