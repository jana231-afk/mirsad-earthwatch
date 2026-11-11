# Mirsad Earthwatch

Design a professional, modern, and realistic web application interface for a graduation project called MIRSAD – AI-Based Disaster Mapping and Assessment System.

The system helps GIS analysts analyze satellite images related to floods and burned areas, visualize the results on maps, calculate affected areas, and generate PDF assessment reports.

IMPORTANT:
Design only features that can realistically be implemented by a small university student team using Python, Flask, SQLite, PyTorch, Rasterio, Leaflet, and ReportLab.

Do not include real-time monitoring, automatic satellite image retrieval, disaster prediction, flood depth estimation, building damage detection, population impact estimation, automatic emergency priority decisions, or advanced AI chatbots.

1. Design Style

Professional GIS dashboard.

Clean, modern, minimal interface.

Dark navy blue, white, and teal color palette.

Use a simple and readable font.

Arabic interface with proper RTL layout.

Support English labels where appropriate.

Desktop-first responsive design.

Use realistic sample data, clearly marked as demo data.

Keep the design simple enough for implementation using Flask, HTML, CSS, and JavaScript.

2. Login Page

Create a login screen containing:

MIRSAD logo and system name.

Username or email field.

Password field.

Login button.

Simple professional background related to satellite imagery or maps.

3. Main Dashboard

After login, show a dashboard containing:

Total number of incidents.

Number of flood incidents.

Number of fire/burned-area incidents.

Number of analyses completed.

Recent incidents table with:

Incident name.

Incident type.

Location.

Date.

Status.

View button.

A clear "Create New Incident" button.

Do not include live statistics or real-time monitoring.

4. Incidents Management Page

Create an incidents list with:

Search by incident name.

Filter by incident type (Flood / Fire).

Filter by status (Open / Closed).

Incident name.

Incident type.

Location.

Incident date.

Status.

View and Edit actions.

Add a simple form to create a new incident:

Incident name.

Incident type: Flood or Fire.

Location.

Incident date.

Description.

Save Incident button.

5. Incident Details Page

When opening an incident, display:

Incident information.

Uploaded satellite images.

Previous analysis runs.

Analysis status.

Latest reviewed analysis.

Button to upload a new satellite image.

Button to start analysis.

Keep all analysis runs linked to the same incident.

6. Satellite Image Upload Page

Create a simple upload interface:

Drag and drop or browse files.

Accept GeoTIFF files.

Select image type and sensor if known.

Enter acquisition date if metadata is unavailable.

Show uploaded file name and size.

Validate image button.

Display validation results:

File readable.

Coordinate reference system (CRS).

Image dimensions.

Number of bands.

NoData information.

Show clear warnings if metadata is missing or the image is unsupported.

Do not design automatic satellite image downloads.

7. Disaster Analysis Page

Create a simple analysis interface.

For Flood Analysis:

Display selected satellite image.

Show selected model: U-Net Flood Segmentation.

Run Analysis button.

Show simple processing status.

Display the resulting water mask after analysis.

For Burned-Area Analysis:

Display the uploaded pre-event and post-event images if available.

Show selected model: U-Net Burned-Area Segmentation.

Run Analysis button.

Display the resulting burned-area mask.

Clearly label burned-area analysis as experimental until its dataset pipeline has been validated.

Do not include active flame detection or disaster prediction.

8. Analysis Results Page

Display:

Original satellite image.

Segmentation mask overlay.

Map legend:

Detected water or burned area.

Valid non-affected area.

NoData area.

Affected area in square kilometers.

Affected area percentage.

Valid analyzed area.

Image acquisition date.

Model name and version.

Analysis date.

Add simple map controls such as zoom and layer visibility.

Do not show automatic emergency priority levels or claim that the model identifies actual damage.

9. Analyst Review Page

Create a review screen for the GIS Analyst:

View original image and segmentation result.

View area statistics.

View image validation warnings.

View analysis information.

Review notes text box.

Mark as Reviewed button.

Mark as Needs Correction button.

Only reviewed results should appear as reviewed results to Field Responders.

10. PDF Report Page

Create a report preview containing:

MIRSAD logo.

Incident details.

Incident type and location.

Satellite image information.

Analysis map.

Affected area in km².

Affected area percentage.

Model information.

Analyst review status.

Methodology and limitations.

Report generation date.

Add a Download PDF button.

11. Field Responder View

Create a simplified read-only interface for Field Responders:

List of authorized incidents.

Incident details.

Latest reviewed analysis.

Map with segmentation overlay.

Affected area statistics.

View or download PDF report.

Field Responders must not be able to upload images, run models, or edit analysis results.

12. User Roles

Include only three roles:

System Administrator: manages user accounts and roles.

GIS Analyst: creates incidents, uploads images, runs analyses, reviews results, and generates reports.

Field Responder: views authorized incidents and reviewed results.

13. Navigation Sidebar

Include:

Dashboard.

Incidents.

Upload Satellite Image.

Analysis History.

Reports.

User Management (Administrator only).

Logout.

Final Design Requirements

Create all screens as a consistent connected web application.

Use realistic sample incident records and map placeholders.

Use simple charts only where necessary.

Avoid complex animations and unnecessary visual effects.

Do not create buttons for features outside the defined scope.

Make the interface practical, understandable, and feasible for a student development team.

Prioritize functionality and clarity over visual complexity.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mirsad-earthwatch.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7031b2b7-fca0-5291-82f7-d587df68390a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
