"""PDF invoice generation using ReportLab."""

import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle, Paragraph,
    Spacer, HRFlowable,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def generate_invoice_pdf(order):
    """Generate a PDF invoice for the given Order instance. Returns bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    elements = []

    # ─── Brand Header ──────────────────────────────────────────────────────────
    brand_style = ParagraphStyle(
        'Brand',
        parent=styles['Title'],
        fontSize=24,
        textColor=colors.HexColor('#FF6B35'),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=12,
    )
    elements.append(Paragraph('🍼 Yellow Baby', brand_style))
    elements.append(Paragraph('Kids Clothing & Accessories', subtitle_style))
    elements.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#FF6B35')))
    elements.append(Spacer(1, 0.4 * cm))

    # ─── Invoice Title & Order ID ──────────────────────────────────────────────
    title_style = ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#333333'),
    )
    elements.append(Paragraph(f'INVOICE', title_style))
    elements.append(Paragraph(f'Order #{order.id}', styles['Normal']))
    elements.append(Spacer(1, 0.4 * cm))

    # ─── Customer & Order Details ──────────────────────────────────────────────
    addr = order.address_snapshot
    customer_info = [
        ['Customer Details', 'Order Details'],
        [
            '\n'.join([
                f"Name: {addr.get('name', 'N/A')}",
                f"Mobile: {addr.get('phone', order.user.mobile)}",
                f"Address: {addr.get('address_line', 'N/A')}",
                f"City: {addr.get('city', 'N/A')}, {addr.get('state', 'N/A')}",
                f"Pincode: {addr.get('pincode', 'N/A')}",
            ]),
            '\n'.join([
                f"Order Date: {order.created_at.strftime('%d %b %Y')}",
                f"Payment: {order.get_payment_method_display()}",
                f"Payment Status: {order.get_payment_status_display()}",
                f"Order Status: {order.get_status_display()}",
            ]),
        ]
    ]

    info_table = Table(customer_info, colWidths=[9 * cm, 9 * cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FFF3ED')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#FF6B35')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FAFAFA')]),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 0.6 * cm))

    # ─── Items Table ───────────────────────────────────────────────────────────
    elements.append(Paragraph('Order Items', ParagraphStyle(
        'SectionTitle', parent=styles['Heading2'],
        fontSize=13, textColor=colors.HexColor('#333333'), spaceAfter=6,
    )))

    item_data = [['#', 'Product', 'Size', 'Qty', 'Unit Price', 'Subtotal']]
    for i, item in enumerate(order.items.all(), 1):
        item_data.append([
            str(i),
            item.product_name,
            item.size,
            str(item.quantity),
            f"₹{item.price:.2f}",
            f"₹{item.subtotal:.2f}",
        ])

    items_table = Table(item_data, colWidths=[1 * cm, 7 * cm, 2 * cm, 1.5 * cm, 3 * cm, 3.5 * cm])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FF6B35')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('ALIGN', (3, 0), (-1, -1), 'RIGHT'),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FFF9F7')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DDDDDD')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 0.4 * cm))

    # ─── Total ─────────────────────────────────────────────────────────────────
    total_data = [
        ['', '', '', '', 'Total Amount:', f"₹{order.total_amount:.2f}"],
    ]
    total_table = Table(total_data, colWidths=[1 * cm, 7 * cm, 2 * cm, 1.5 * cm, 3 * cm, 3.5 * cm])
    total_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('ALIGN', (4, 0), (-1, -1), 'RIGHT'),
        ('TEXTCOLOR', (5, 0), (5, 0), colors.HexColor('#FF6B35')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(total_table)
    elements.append(Spacer(1, 1 * cm))

    # ─── Footer ────────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width='100%', thickness=1, color=colors.HexColor('#DDDDDD')))
    elements.append(Spacer(1, 0.3 * cm))
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, textColor=colors.grey, alignment=TA_CENTER,
    )
    elements.append(Paragraph(
        'Thank you for shopping with Yellow Baby! 💛 | support@yellowbaby.in',
        footer_style,
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
