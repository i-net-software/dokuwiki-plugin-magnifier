<?php
/**
 * magnifier Plugin
 *
 * @license    GPL 2 (http://www.gnu.org/licenses/gpl.html)
 * @author     i-net software <tools@inetsoftware.de>
 * @author     Gerry Weissbach <gweissbach@inetsoftware.de>
 */

// must be run within Dokuwiki
if(!defined('DOKU_INC')) die();
if (!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');

require_once(DOKU_PLUGIN.'syntax.php');

class syntax_plugin_magnifier extends DokuWiki_Syntax_Plugin {

    private $headers = array();

    function getInfo(){
        return array_merge(confToHash(dirname(__FILE__).'/plugin.info.txt'), array());
    }

    function getType() { return 'substition'; }
    function getPType() { return 'normal'; }
    function getSort() { return 98; }

    function connectTo($mode) {
         
        $this->Lexer->addSpecialPattern('{{magnifier>[^}]+}}', $mode, 'plugin_magnifier');
    }

    function handle($match, $state, $pos, &$handler) {

	    // {{magnifier>:image:test.png?widthxheight}}

        $orig = substr($match, 12, -2);
        
        list($id, $param) = explode('?', $orig, 2); // find ID + Params
        list($w, $h) = explode('x', $param, 2); // find Size
        /*
        if ( preg_match("/{{[^}]+}}/", $name)) {
         
        $displayImage = substr($name, 2, -2); // strip markup
        $name = array();
        list($name['id'], $name['name']) = explode('|', $displayImage, 2); // find ID/Params + Name Extension
        list($name['id'], $name['param']) = explode('?', $name['id'], 2); // find ID + Params
        list($name['w'], $name['h']) = explode('x', $name['param'], 2); // find Size
        }
        */
        return array(trim($id), $w, $h, $orig);
    }

    function render($mode, &$renderer, $data) {
        global $ID, $conf, $JSINFO;

        list($id, $w, $h, $orig) = $data;
        if ( empty($id) ) { $exists = false; } else
        {
        	$id = cleanID($id);
            $page   = resolve_id(getNS($ID),$id);
            $file   = mediaFN($page);
            $exists = @file_exists($file) && @is_file($file);
        }

        if ($mode == 'xhtml') {

            $params = ''; $params2 = '';

            if ( $exists ) {
                // is Media

                $p1 = Doku_Handler_Parse_Media($orig);
                $scID = sectionID(noNs($id), $this->headers);

                $p = array();
                $p['alt'] = $id;
                $p['class'] = 'magnifierImage';
                $p['id'] = 'magnifierimage_' . $scID;
                $p['magnifierImage'] = ml($id);
                if ($p1['width']) $p['width'] = $p1['width'];
                if ($p1['height']) $p['height'] = $p1['height'];
                if ($p1['title'] && !$p['title']) { $p['title'] = $p1['title']; $p['alt'] = $p1['title']; }
                if ($p1['align']) $p['class'] .= ' media' . $p1['align'];

                $p2 = buildAttributes($p);
                $renderer->doc .= '<img src="' . ml($id, array( 'w' => $p['width'], 'h' => $p['height'] ) ) . '" '.$p2.'/>';

                return true;
            }
        }
        return false;
    }

    function _renderFinalPopupImage($id, $exists, $more, $name, $isImageMap, $script, $class='') {

        $more .= ' class="wikilink' . ($exists?1:2) . (!empty($class) ? ' ' . $class : '' ). '"';
        $name = trim(preg_replace("%^(\s|\r|\n)*?<a.+?>(.*)?</a>(\s|\r|\n)*?$%is", "$2", preg_replace("%^(\s|\r|\n)*?<p.*?>(.*)?</p>(\s|\r|\n)*?$%is", "$2", $name)));
         
        if ( !is_array($isImageMap) ) {
            return '<a href="'.$id.'" ' . $more . ' >' . $name . '</a>' . $script;
        } else {
            $return = '<area href="'.$id.'" ' . $more . '';
            $return .= ' title="'.$name.'" alt="'.$name.'"';
            $return .= ' shape="'.$isImageMap['shape'].'" coords="'.$isImageMap['coords'].'" />' . $script;
            
            return $return;
        }
    }
}
// vim:ts=4:sw=4:et:enc=utf-8:
