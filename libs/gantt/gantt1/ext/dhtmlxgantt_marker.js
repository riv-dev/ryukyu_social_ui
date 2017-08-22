/*
@license

dhtmlxGantt v.4.2.1 Stardard
This software is covered by GPL license. You also can obtain Commercial or Enterprise license to use it in non-GPL project - please contact sales@dhtmlx.com. Usage without proper license is prohibited.

(c) Dinamenta, UAB.
*/
gantt1._markers||(gantt1._markers={}),gantt1.config.show_markers=!0,gantt1.attachEvent("onClear",function(){gantt1._markers={}}),gantt1.attachEvent("onGanttReady",function(){function t(t){if(!gantt1.config.show_markers)return!1;if(!t.start_date)return!1;var e=gantt1.getState();if(!(+t.start_date>+e.max_date||+t.end_date&&+t.end_date<+e.min_date||+t.start_date<+e.min_date)){var n=document.createElement("div");n.setAttribute("marker_id",t.id);var a="gantt1_marker";gantt1.templates.marker_class&&(a+=" "+gantt1.templates.marker_class(t)),
t.css&&(a+=" "+t.css),t.title&&(n.title=t.title),n.className=a;var i=gantt1.posFromDate(t.start_date);if(n.style.left=i+"px",n.style.height=Math.max(gantt1._y_from_ind(gantt1._order.length),0)+"px",t.end_date){var s=gantt1.posFromDate(t.end_date);n.style.width=Math.max(s-i,0)+"px"}return t.text&&(n.innerHTML="<div class='gantt1_marker_content' >"+t.text+"</div>"),n}}var e=document.createElement("div");e.className="gantt1_marker_area",gantt1.$task_data.appendChild(e),gantt1.$marker_area=e,gantt1._markerRenderer=gantt1._task_renderer("markers",t,gantt1.$marker_area,null);
}),gantt1.attachEvent("onDataRender",function(){gantt1.renderMarkers()}),gantt1.getMarker=function(t){return this._markers?this._markers[t]:null},gantt1.addMarker=function(t){return t.id=t.id||gantt1.uid(),this._markers[t.id]=t,t.id},gantt1.deleteMarker=function(t){return this._markers&&this._markers[t]?(delete this._markers[t],!0):!1},gantt1.updateMarker=function(t){this._markerRenderer&&this._markerRenderer.render_item(this.getMarker(t))},gantt1._getMarkers=function(){var t=[];for(var e in this._markers)t.push(this._markers[e]);
return t},gantt1.renderMarkers=function(){if(!this._markers)return!1;if(!this._markerRenderer)return!1;var t=this._getMarkers();return this._markerRenderer.render_items(t),!0};
//# sourceMappingURL=../sources/ext/dhtmlxgantt1_marker.js.map