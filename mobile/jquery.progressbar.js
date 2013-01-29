// the widget definition, where "custom" is the namespace,
// "progressbar" the widget name
$.widget( "custom.progressbar", {
    // default options
    options: {
        min: 0,
        max: 100,
        value: 0,
        height: 10,

        // callbacks
        change: null
    },

    // the constructor
    _create: function() {
        this.element
            .attr('data-theme', 'a')
            // add a class for theming
            .addClass( "custom-progressbar ui-corner-all ui-bar-c" );
            // prevent double click to select text
            //.disableSelection();

        this.progress = $('<div class="custom-progressbar-value ui-corner-all ui-bar-b">&nbsp;</div>').appendTo(this.element);

        this._refresh();
    },

    // called when created, and later when changing options
    _refresh: function() {

        this.progress.css( "width", this.options.value + "%" );
        this.element.css('height', this.options.height + 'px');
        this.progress.css('height', this.options.height + 'px');

        // trigger a callback/event
        this._trigger( "change" );
    },

    // events bound via _on are removed automatically
    // revert other modifications here
    _destroy: function() {
        this.element
            .removeClass( "custom-progressbar ui-corner-all" )
            .attr('data-theme', null);
            //.enableSelection()

        this.progress.remove();
    },

    // _setOptions is called with a hash of all options that are changing
    // always refresh when changing options
    _setOptions: function() {
        // _super and _superApply handle keeping the right this-context
        this._superApply( arguments );
        this._refresh();
    },

    // _setOption is called for each individual option that is changing
    _setOption: function( key, value ) {
        // prevent invalid color values
        this._super( key, value );
    }
}); 
