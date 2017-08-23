/*
@license

dhtmlxGantt v.4.2.1 Stardard
This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
gantt3._markers||(gantt3._markers={}),gantt3.config.show_markers=!0,gantt3.attachEvent("onClear",function(){gantt3._markers={}}),gantt3.attachEvent("onGanttReady",function(){function t(t){if(!gantt3.config.show_markers)return!1;if(!t.start_date)return!1;var e=gantt3.getState();if(!(+t.start_date>+e.max_date||+t.end_date&&+t.end_date<+e.min_date||+t.start_date<+e.min_date)){var n=document.createElement("div");n.setAttribute("marker_id",t.id);var a="gantt3_marker";gantt3.templates.marker_class&&(a+=" "+gantt3.templates.marker_class(t)),
t.css&&(a+=" "+t.css),t.title&&(n.title=t.title),n.className=a;var i=gantt3.posFromDate(t.start_date);if(n.style.left=i+"px",n.style.height=Math.max(gantt3._y_from_ind(gantt3._order.length),0)+"px",t.end_date){var s=gantt3.posFromDate(t.end_date);n.style.width=Math.max(s-i,0)+"px"}return t.text&&(n.innerHTML="<div class='gantt3_marker_content' >"+t.text+"</div>"),n}}var e=document.createElement("div");e.className="gantt3_marker_area",gantt3.$task_data.appendChild(e),gantt3.$marker_area=e,gantt3._markerRenderer=gantt3._task_renderer("markers",t,gantt3.$marker_area,null);
}),gantt3.attachEvent("onDataRender",function(){gantt3.renderMarkers()}),gantt3.getMarker=function(t){return this._markers?this._markers[t]:null},gantt3.addMarker=function(t){return t.id=t.id||gantt3.uid(),this._markers[t.id]=t,t.id},gantt3.deleteMarker=function(t){return this._markers&&this._markers[t]?(delete this._markers[t],!0):!1},gantt3.updateMarker=function(t){this._markerRenderer&&this._markerRenderer.render_item(this.getMarker(t))},gantt3._getMarkers=function(){var t=[];for(var e in this._markers)t.push(this._markers[e]);
return t},gantt3.renderMarkers=function(){if(!this._markers)return!1;if(!this._markerRenderer)return!1;var t=this._getMarkers();return this._markerRenderer.render_items(t),!0};
//# sourceMappingURL=../sources/ext/dhtmlxgantt3_marker.js.map